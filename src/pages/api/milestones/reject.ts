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

const rejectSchema = z.object({
  milestoneId: z.string().uuid(),
  reason: z.string().min(1).max(500).optional(),
});

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;
  const userSponsorId = req.userSponsorId;

  if (!userId || !userSponsorId) {
    logger.warn('Invalid token: User ID or Sponsor ID not found');
    return res.status(400).json({ error: 'Invalid token' });
  }

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  const validationResult = rejectSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.warn('Invalid request body', validationResult.error);
    return res.status(400).json({
      error: 'Invalid request body',
      details: validationResult.error.errors,
    });
  }

  const { milestoneId, reason } = validationResult.data;

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

    if (['Approved', 'Paid'].includes(milestone.status)) {
      logger.warn(
        `Cannot reject milestone ${milestoneId} that is already approved or paid`,
      );
      return res.status(400).json({
        error: 'Cannot reject a milestone that is already approved or paid',
      });
    }

    if (milestone.status === 'Rejected') {
      logger.warn(`Milestone ${milestoneId} is already rejected`);
      return res.status(400).json({
        error: 'Milestone is already rejected',
      });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'Rejected',
      },
    });

    await eventLogger.log({
      eventType: EventType.MILESTONE_REJECTED,
      actor: {
        id: userId as string,
        type: 'SPONSOR',
      },
      data: {
        reason: reason || 'No reason provided',
      },
      entities: {
        listingId: milestone.submission.listingId,
        submissionId: milestone.submissionId,
        sponsorId: userSponsorId,
        milestoneId: milestoneId,
      },
    });

    logger.info(`Successfully rejected milestone ${milestoneId}`);
    return res.status(200).json({
      message: 'Milestone rejected successfully',
      milestone: updatedMilestone,
    });
  } catch (error: any) {
    logger.error(`Error rejecting milestone ${milestoneId}: ${error.message}`);
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while rejecting milestone.',
    });
  }
}

export default withSponsorAuth(handler);
