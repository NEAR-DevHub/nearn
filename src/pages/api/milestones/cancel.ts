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
  submissionId: z.string().uuid(),
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

  const { submissionId, reason } = validationResult.data;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        listing: true,
        user: true,
        Milestones: true,
      },
    });

    if (!submission) {
      logger.warn(`Submission with ID ${submissionId} not found`);
      return res.status(404).json({
        error: `Submission with ID ${submissionId} not found.`,
      });
    }

    const { error } = await checkListingSponsorAuth(
      userSponsorId,
      submission.listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    await prisma.milestone.updateMany({
      where: {
        submissionId: submissionId,
        status: {
          in: ['InReview', 'NotStarted'],
        },
      },
      data: {
        status: 'Cancelled',
      },
    });

    const cancelledMilestones = await prisma.milestone.findMany({
      where: { submissionId: submissionId, status: 'Cancelled' },
    });

    for (const milestone of cancelledMilestones) {
      await eventLogger.log({
        eventType: EventType.MILESTONE_CANCELLED,
        actor: {
          id: userId as string,
          type: 'SPONSOR',
        },
        data: {
          reason: reason || 'No reason provided',
        },
        entities: {
          listingId: submission.listingId,
          submissionId: submissionId,
          sponsorId: userSponsorId,
          milestoneId: milestone.id,
        },
      });
    }

    logger.info(
      `Successfully cancelled milestones for submission ${submissionId}`,
    );
    return res.status(200).json({
      message: 'Milestones cancelled successfully',
      milestones: cancelledMilestones,
    });
  } catch (error: any) {
    logger.error(
      `Error cancelling milestones for submission ${submissionId}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while cancelling milestones.',
    });
  }
}

export default withSponsorAuth(handler);
