import { type MilestoneStatus } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { z } from 'zod';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

const updateStatusSchema = z.object({
  milestoneId: z.string().uuid(),
  status: z.enum(['Pending', 'NotStarted', 'WorkCompleted']),
});

async function handler(
  req: NextApiRequestWithPotentialSponsor,
  res: NextApiResponse,
) {
  const userId = req.userId;

  if (!userId || !req.authorized) {
    logger.warn('Unauthorized: User not authenticated');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  const validationResult = updateStatusSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.warn('Invalid request body', validationResult.error);
    return res.status(400).json({
      error: 'Invalid request body',
      details: validationResult.error.errors,
    });
  }

  const { milestoneId, status } = validationResult.data;

  try {
    // Get milestone with submission and listing details
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

    // Check authorization
    const isTalent = milestone.submission.userId === userId;
    const isSponsor =
      req.sponsorIds &&
      req.sponsorIds.includes(milestone.submission.listing.sponsorId);

    if (!isTalent && !isSponsor) {
      logger.warn(
        `User ${userId} not authorized to update milestone ${milestoneId}`,
      );
      return res.status(403).json({
        error: 'You are not authorized to update this milestone',
      });
    }

    // Validate status transition
    const currentStatus = milestone.status;
    const actorType: 'TALENT' | 'SPONSOR' = isTalent ? 'TALENT' : 'SPONSOR';

    if (['Approved', 'Paid', 'Rejected'].includes(currentStatus)) {
      logger.warn(`Cannot update milestone in ${currentStatus} status`);
      return res.status(400).json({
        error: `Cannot update milestone that is already ${currentStatus}`,
      });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: status as MilestoneStatus,
        updatedAt: new Date(),
      },
    });

    // Log event
    await eventLogger.log({
      eventType: EventType.MILESTONE_STATUS_UPDATED,
      actor: {
        id: userId as string,
        type: actorType,
      },
      data: {
        previousStatus: currentStatus,
        newStatus: status,
      },
      entities: {
        listingId: milestone.submission.listingId,
        submissionId: milestone.submissionId,
        sponsorId: milestone.submission.listing.sponsorId,
        milestoneId: milestoneId,
      },
    });

    logger.info(
      `Successfully updated milestone ${milestoneId} status from ${currentStatus} to ${status}`,
    );
    return res.status(200).json({
      message: 'Milestone status updated successfully',
      milestone: updatedMilestone,
    });
  } catch (error: any) {
    logger.error(
      `Error updating milestone ${milestoneId} status: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while updating milestone status.',
    });
  }
}

export default withPotentialSponsorAuth(handler);
