import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { editMilestonesSchema } from '@/features/listing-payment-setup/schemas/milestone.schema';
import { type Rewards } from '@/features/listings/types';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;
  const userSponsorId = req.userSponsorId;

  if (!userId || !userSponsorId) {
    logger.warn('Invalid token: User ID or Sponsor ID not found');
    return res.status(400).json({ error: 'Invalid token' });
  }

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  const validationResult = editMilestonesSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.warn('Invalid request body', validationResult.error);
    return res.status(400).json({
      error: 'Invalid request body',
      details: validationResult.error.errors,
    });
  }

  const { submissionId, milestones } = validationResult.data;

  try {
    // Get submission with all milestones
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        listing: true,
        Milestones: {
          orderBy: { milestoneIndex: 'asc' },
        },
      },
    });

    if (!submission) {
      logger.warn(`Submission with ID ${submissionId} not found`);
      return res.status(404).json({
        error: `Submission with ID ${submissionId} not found.`,
      });
    }

    // Check authorization
    const { error } = await checkListingSponsorAuth(
      userSponsorId,
      submission.listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    // Get existing approved/paid milestones
    const approvedOrPaidMilestones = submission.Milestones.filter((m) =>
      ['Approved', 'Paid'].includes(m.status),
    );

    if (milestones.length + approvedOrPaidMilestones.length < 2) {
      return res.status(400).json({
        error: 'At least 2 milestones are required after editing',
      });
    }

    // Calculate total: approved/paid + provided
    const approvedTotal = approvedOrPaidMilestones.reduce(
      (sum, m) => sum + m.reward,
      0,
    );
    const providedTotal = milestones.reduce((sum, m) => sum + m.reward, 0);
    const newTotal = approvedTotal + providedTotal;

    // Get expected total from listing rewards
    const rewards: Rewards = (submission.listing.rewards || {}) as Rewards;
    const winnerPosition = submission.winnerPosition;
    const expectedTotal =
      winnerPosition !== null
        ? rewards[winnerPosition as keyof Rewards] || 0
        : 0;

    // Check if reward matches target
    if (Math.abs(newTotal - expectedTotal) > 0.01) {
      logger.warn(
        `New total rewards (${newTotal}) would not match expected total (${expectedTotal})`,
      );
      return res.status(400).json({
        error: `Total milestone rewards (${newTotal}) must equal expected total (${expectedTotal})`,
        breakdown: {
          approvedOrPaid: approvedTotal,
          provided: providedTotal,
          total: newTotal,
          expected: expectedTotal,
        },
      });
    }

    // Get token
    const token =
      submission.listing.token === 'Any'
        ? submission.token || submission.listing.token
        : submission.listing.token;
    const maxApprovedOrPaidMilestoneIndex = approvedOrPaidMilestones.reduce(
      (max, m) => Math.max(max, m.milestoneIndex),
      0,
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.milestone.deleteMany({
        where: {
          submissionId,
          status: {
            notIn: ['Approved', 'Paid'],
          },
        },
      });

      const milestoneData = milestones.map((milestone, index) => ({
        submissionId,
        milestoneIndex: maxApprovedOrPaidMilestoneIndex + 1 + index,
        title: milestone.title,
        description: milestone.description || null,
        deadline: milestone.deadline ? new Date(milestone.deadline) : null,
        reward: milestone.reward,
        token: token!,
        status: index === 0 ? ('InProgress' as const) : ('NotStarted' as const),
      }));

      await tx.milestone.createMany({
        data: milestoneData,
      });

      // Fetch all milestones after update
      const finalMilestones = await tx.milestone.findMany({
        where: { submissionId },
        orderBy: { milestoneIndex: 'asc' },
      });

      return finalMilestones;
    });

    // Log event
    await eventLogger.log({
      eventType: EventType.MILESTONES_EDITED,
      actor: {
        id: userId as string,
        type: 'SPONSOR',
      },
      data: {
        oldMilestones: submission.Milestones.map((m) => ({
          milestoneIndex: m.milestoneIndex,
          title: m.title,
          reward: m.reward,
          status: m.status,
        })),
        newMilestones: result.map((m) => ({
          milestoneIndex: m.milestoneIndex,
          title: m.title,
          reward: m.reward,
          status: m.status,
        })),
      },
      entities: {
        listingId: submission.listingId,
        submissionId: submissionId,
        sponsorId: userSponsorId,
      },
    });

    logger.info(
      `Successfully updated milestones for submission: ${submissionId}`,
    );
    return res.status(200).json({
      message: 'Milestones updated successfully',
      milestones: result,
    });
  } catch (error: any) {
    logger.error(
      `Error editing milestones for submission ${submissionId}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while editing milestones.',
    });
  }
}

export default withSponsorAuth(handler);
