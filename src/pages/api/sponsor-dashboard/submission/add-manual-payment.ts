import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import {
  detectManualPaymentChanges,
  EventType,
} from '@/features/logging/types/event-data';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;

  logger.debug(`Request body: ${safeStringify(req.body)}`);
  const { id, amount, token, paymentDate, notes, isPublic, fiatCurrency } =
    req.body;

  if (!id || !amount || !token || !paymentDate) {
    logger.warn('Required fields missing for manual payment');
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'ID, amount, currency, and payment date are required',
    });
  }

  if (token === 'Fiat' && !fiatCurrency) {
    return res.status(400).json({
      error: 'Fiat currency is required when token is Fiat',
      message: 'Fiat currency is required when token is Fiat',
    });
  }

  try {
    const currentMilestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        submission: {
          include: {
            user: true,
            listing: true,
          },
        },
      },
    });

    if (!currentMilestone) {
      logger.warn(`Milestone with ID ${id} not found`);
      return res.status(404).json({
        message: `Milestone with ID ${id} not found.`,
      });
    }

    const userSponsorId = req.userSponsorId;

    const { error } = await checkListingSponsorAuth(
      userSponsorId,
      currentMilestone.submission.listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const { winnerPosition } = currentMilestone.submission;
    if (!winnerPosition) {
      return res.status(400).json({
        error: 'Submission has no winner position',
        message: 'Submission has no winner position',
      });
    }

    const manualPaymentDetails = {
      amount: parseFloat(amount),
      token,
      fiatCurrency,
      paymentDate,
      notes: notes || '',
      isPublic: isPublic === true,
    };

    const isUpdating = !!currentMilestone.paymentDetails;

    const existingPaymentDetails =
      (currentMilestone.paymentDetails as any) || {};
    const updatedPaymentDetails = {
      ...existingPaymentDetails,
      manual: manualPaymentDetails,
    };

    logger.debug(
      `Updating milestone for submission ID: ${id} for manual payment`,
    );
    const result = await prisma.milestone.update({
      where: { id },
      data: {
        status: 'Paid',
        paidDate: new Date(paymentDate),
        paidBy: userId,
        paymentDetails: updatedPaymentDetails,
      },
    });

    logger.info(`Sending payment notification email for submission ID: ${id}`);

    const changes = isUpdating
      ? detectManualPaymentChanges(
          existingPaymentDetails.manual,
          manualPaymentDetails,
        )
      : [];

    if (changes.length > 0 || !isUpdating) {
      // Log the manual payment activity
      await eventLogger.log({
        eventType: isUpdating
          ? EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED
          : EventType.SUBMISSION_MANUAL_PAYMENT_ADDED,
        actor: {
          id: userId,
          type: 'SPONSOR',
        },
        entities: {
          sponsorId: userSponsorId,
          submissionId: id,
          listingId: currentMilestone.submission.listingId,
        },
        data: {
          changes: changes,
        },
      });
    }

    const bounty = await prisma.bounties.findUnique({
      where: {
        id: currentMilestone.submission.listingId,
      },
      include: {
        BountyCounts: true,
      },
    });
    if (
      bounty &&
      bounty.isWinnersAnnounced &&
      bounty?.BountyCounts.totalPaymentsMade ===
        bounty.BountyCounts.totalWinnersSelected
    ) {
      eventLogger.log({
        eventType: EventType.SYSTEM_STATUS_CHANGED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          oldStatus: 'Payment Pending',
          newStatus: 'Completed',
        },
        entities: {
          listingId: currentMilestone.submission.listingId,
          sponsorId: currentMilestone.submission.listing.sponsorId,
        },
      });
    }

    logger.info(`Successfully added manual payment for submission ID: ${id}`);
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `Error adding manual payment for submission ${id}: ${safeStringify(
        error,
      )}`,
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while adding manual payment for submission ${id}.`,
    });
  }
}

export default withSponsorAuth(handler);
