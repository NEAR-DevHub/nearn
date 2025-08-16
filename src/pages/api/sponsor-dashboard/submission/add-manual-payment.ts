import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { sendEmailNotification } from '@/features/emails/utils/sendEmailNotification';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;

  logger.debug(`Request body: ${safeStringify(req.body)}`);
  const { id, amount, currency, paymentDate, notes, isPublic } = req.body;

  if (!id || !amount || !currency || !paymentDate) {
    logger.warn('Required fields missing for manual payment');
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'ID, amount, currency, and payment date are required',
    });
  }

  try {
    const currentSubmission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        listing: true,
      },
    });

    if (!currentSubmission) {
      logger.warn(`Submission with ID ${id} not found`);
      return res.status(404).json({
        message: `Submission with ID ${id} not found.`,
      });
    }

    const userSponsorId = req.userSponsorId;

    const { error } = await checkListingSponsorAuth(
      userSponsorId,
      currentSubmission.listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const { winnerPosition } = currentSubmission;
    if (!winnerPosition) {
      return res.status(400).json({
        error: 'Submission has no winner position',
        message: 'Submission has no winner position',
      });
    }

    const manualPaymentDetails = {
      amount: parseFloat(amount),
      currency,
      paymentDate,
      notes: notes || '',
      isPublic: isPublic === true,
    };

    const existingPaymentDetails =
      (currentSubmission.paymentDetails as any) || {};
    const updatedPaymentDetails = {
      ...existingPaymentDetails,
      manual: manualPaymentDetails,
    };

    logger.debug(`Updating submission with ID: ${id} for manual payment`);
    const result = await prisma.submission.update({
      where: {
        id,
      },
      data: {
        isPaid: true,
        paymentDate: new Date(paymentDate),
        paidBy: userId,
        paymentDetails: updatedPaymentDetails,
      },
    });

    logger.info(`Sending payment notification email for submission ID: ${id}`);
    sendEmailNotification({
      type: 'addPayment',
      id,
      triggeredBy: userId,
    });

    // Log the manual payment activity
    await eventLogger.log({
      eventType: EventType.SUBMISSION_MANUAL_PAYMENT_ADDED,
      actor: {
        id: userId,
        type: 'SPONSOR',
      },
      entities: {
        submissionId: id,
        listingId: currentSubmission.listingId,
      },
      data: manualPaymentDetails,
    });

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
