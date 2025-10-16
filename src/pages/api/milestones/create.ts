import type { NextApiResponse } from 'next';
import { z } from 'zod';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { type Rewards } from '@/features/listings/types';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

const milestoneSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  reward: z.number().positive(),
  milestoneIndex: z.number().int().positive(),
});

const createMilestonesSchema = z.object({
  submissionId: z.string().uuid(),
  useSingleMilestone: z.boolean(),
  milestones: z.array(milestoneSchema).optional(),
});

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;
  const userSponsorId = req.userSponsorId;

  if (!userId || !userSponsorId) {
    logger.warn('Invalid token: User ID or Sponsor ID not found');
    return res.status(400).json({ error: 'Invalid token' });
  }

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  const validationResult = createMilestonesSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.warn('Invalid request body', validationResult.error);
    return res.status(400).json({
      error: 'Invalid request body',
      details: validationResult.error.errors,
    });
  }

  const { submissionId, useSingleMilestone, milestones } =
    validationResult.data;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        listing: true,
        Milestones: true,
      },
    });

    if (!submission) {
      logger.warn(`Submission with ID ${submissionId} not found`);
      return res.status(404).json({
        error: `Submission with ID ${submissionId} not found.`,
      });
    }

    if (submission.Milestones.length > 0) {
      logger.warn(`Milestones already exist for submission ${submissionId}`);
      return res.status(400).json({
        error: 'Milestones already exist for this submission',
      });
    }

    const { error } = await checkListingSponsorAuth(
      userSponsorId,
      submission.listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    if (submission.status !== 'Approved' || !submission.isWinner) {
      logger.warn(`Submission ${submissionId} is not approved or not a winner`);
      return res.status(400).json({
        error:
          'Milestones can only be created for approved winning submissions',
      });
    }

    const rewards: Rewards = (submission.listing.rewards || {}) as Rewards;
    const winnerPosition = submission.winnerPosition;
    const totalReward =
      winnerPosition !== null
        ? rewards[winnerPosition as keyof Rewards] || 0
        : 0;

    if (totalReward <= 0) {
      logger.warn(`No reward found for winner position ${winnerPosition}`);
      return res.status(400).json({
        error: 'No reward found for this winner position',
      });
    }

    const token =
      submission.listing.token === 'Any'
        ? submission.token || submission.listing.token
        : submission.listing.token;

    let createdMilestones;

    if (useSingleMilestone) {
      // Create single dummy milestone with full reward
      createdMilestones = await prisma.milestone.create({
        data: {
          submissionId,
          milestoneIndex: 1,
          title: 'Full Payment',
          description: 'Single milestone for full payment',
          reward: totalReward,
          token: token!,
          status: 'NotStarted',
        },
      });
      createdMilestones = [createdMilestones];
    } else {
      if (!milestones || milestones.length === 0) {
        return res.status(400).json({
          error: 'Milestones array is required when not using single milestone',
        });
      }

      const milestonesTotal = milestones.reduce((sum, m) => sum + m.reward, 0);
      if (Math.abs(milestonesTotal - totalReward) > 0.0001) {
        logger.warn(
          `Milestone rewards sum (${milestonesTotal}) does not equal total reward (${totalReward})`,
        );
        return res.status(400).json({
          error: `Sum of milestone rewards (${milestonesTotal}) must equal total reward (${totalReward})`,
        });
      }

      // Create multiple milestones
      const milestoneData = milestones.map((milestone) => ({
        submissionId,
        milestoneIndex: milestone.milestoneIndex,
        title: milestone.title,
        description: milestone.description || null,
        deadline: milestone.deadline ? new Date(milestone.deadline) : null,
        reward: milestone.reward,
        token: token!,
        status: 'NotStarted' as const,
      }));

      createdMilestones = await prisma.milestone.createMany({
        data: milestoneData,
      });

      createdMilestones = await prisma.milestone.findMany({
        where: { submissionId },
        orderBy: { milestoneIndex: 'asc' },
      });
    }

    await eventLogger.log({
      eventType: EventType.MILESTONE_CREATED,
      actor: {
        id: userId as string,
        type: 'SPONSOR',
      },
      data: {
        rewardDistribution: createdMilestones.map((milestone) => ({
          milestoneIndex: milestone.milestoneIndex,
          reward: milestone.reward,
        })),
        useSingleMilestone,
      },
      entities: {
        listingId: submission.listingId,
        submissionId,
        sponsorId: userSponsorId,
      },
    });

    logger.info(
      `Successfully created milestones for submission: ${submissionId}`,
    );
    return res.status(200).json({
      message: 'Milestones created successfully',
      milestones: createdMilestones,
    });
  } catch (error: any) {
    logger.error(
      `Error creating milestones for submission ${submissionId}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while creating milestones.',
    });
  }
}

export default withSponsorAuth(handler);
