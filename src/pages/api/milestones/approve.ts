import type { NextApiResponse } from 'next';
import { z } from 'zod';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

const approveSchema = z.object({
  milestoneId: z.string().uuid(),
});

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;
  const userSponsorId = req.userSponsorId;

  if (!userId || !userSponsorId) {
    logger.warn('Invalid token: User ID or Sponsor ID not found');
    return res.status(400).json({ error: 'Invalid token' });
  }

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  const validationResult = approveSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.warn('Invalid request body', validationResult.error);
    return res.status(400).json({
      error: 'Invalid request body',
      details: validationResult.error.errors,
    });
  }

  const { milestoneId } = validationResult.data;

  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        submission: {
          include: {
            listing: true,
            user: true,
          },
        },
      },
    });

    if (!milestone) {
      logger.warn(`Milestone with ID ${milestoneId} not found`);
      return res.status(404).json({
        error: `Milestone with ID ${milestoneId} not found.`,
      });
    }

    const { error } = await checkListingSponsorAuth(
      userSponsorId,
      milestone.submission.listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    if (['Approved', 'Paid', 'Cancelled'].includes(milestone.status)) {
      logger.warn(`Milestone ${milestoneId} is already ${milestone.status}`);
      return res.status(400).json({
        error: `Milestone ${milestoneId} is already ${milestone.status}`,
      });
    }

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'Approved',
        approvedDate: new Date(),
        approvedBy: userId,
        updatedAt: new Date(),
      },
    });

    await eventLogger.log({
      eventType: EventType.MILESTONE_APPROVED,
      actor: {
        id: userId as string,
        type: 'SPONSOR',
      },
      data: {},
      entities: {
        listingId: milestone.submission.listingId,
        submissionId: milestone.submissionId,
        sponsorId: userSponsorId,
        milestoneId: milestoneId,
      },
    });

    const nextMilestone = await prisma.milestone.findFirst({
      where: {
        submissionId: milestone.submissionId,
        milestoneIndex: milestone.milestoneIndex + 1,
      },
    });

    if (nextMilestone) {
      await prisma.milestone.update({
        where: { id: nextMilestone.id },
        data: { status: 'InProgress' },
      });

      await eventLogger.log({
        eventType: EventType.MILESTONE_STATUS_UPDATED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          previousStatus: 'NotStarted',
          newStatus: 'InProgress',
        },
        entities: {
          listingId: milestone.submission.listingId,
          submissionId: milestone.submissionId,
          sponsorId: userSponsorId,
          milestoneId: nextMilestone.id,
        },
      });
    }

    logger.info(`Successfully approved milestone ${milestoneId}`);
    return res.status(200).json({
      message: 'Milestone approved successfully',
    });
  } catch (error: any) {
    logger.error(`Error approving milestone ${milestoneId}: ${error.message}`);
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while approving milestone.',
    });
  }
}

export default withSponsorAuth(handler);
