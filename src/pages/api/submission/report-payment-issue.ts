import type { NextApiRequest, NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { withAuth } from '@/features/auth/utils/withAuth';
import { PaymentIssueTemplate } from '@/features/emails/components/paymentIssueTemplate';
import { fromEmail, replyToEmail } from '@/features/emails/utils/fromEmails';
import { resend } from '@/features/emails/utils/resend';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = (req as any).userId;
  const { submissionId, description } = req.body;

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  if (!submissionId || !description) {
    logger.warn('Missing required fields for payment issue report');
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Submission ID and description are required',
    });
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: true,
        listing: true,
      },
    });

    if (!submission) {
      logger.warn(`Submission with ID ${submissionId} not found`);
      return res.status(404).json({
        message: `Submission with ID ${submissionId} not found.`,
      });
    }

    // Check if the user is the owner of the submission
    if (submission.userId !== userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only report issues for your own submissions',
      });
    }

    // Check if submission has manual payment
    const paymentDetails = submission.paymentDetails as any;
    if (!paymentDetails?.manual) {
      return res.status(400).json({
        error: 'No manual payment found',
        message: 'This submission does not have a manual payment to report',
      });
    }

    // Store in  log for tracking
    await eventLogger.log({
      eventType: EventType.SUBMISSION_MANUAL_PAYMENT_ISSUE_REPORTED,
      actor: {
        id: userId,
        type: 'TALENT',
      },
      entities: {
        submissionId,
        listingId: submission.listingId,
      },
      data: {
        description,
        paymentAmount: paymentDetails.manual.amount,
        paymentCurrency: paymentDetails.manual.currency,
        paymentDate: paymentDetails.manual.paymentDate,
        userEmail: submission.user.email,
        userName:
          submission.user.name || submission.user.username || 'Unknown User',
      },
    });

    // Send email notification to NEARN team
    try {
      const submissionUrl = `${process.env.NEXT_PUBLIC_URL}/submission/${submissionId}`;

      if (process.env.CEO_EMAIL) {
        await resend.emails.send({
          from: fromEmail,
          to: [process.env.CEO_EMAIL],
          subject: `Payment Issue Reported - ${submission.listing.title}`,
          react: PaymentIssueTemplate({
            userName:
              submission.user.name ||
              submission.user.username ||
              'Unknown User',
            userEmail: submission.user.email,
            submissionId,
            listingTitle: submission.listing.title,
            description,
            paymentAmount: paymentDetails.manual.amount,
            paymentCurrency: paymentDetails.manual.currency,
            paymentDate: paymentDetails.manual.paymentDate,
            submissionUrl,
          }),
          replyTo: replyToEmail,
        });

        logger.info(
          `Payment issue notification email sent to NEARN team for submission ID: ${submissionId}`,
        );
      } else {
        logger.warn(
          'CEO_EMAIL not configured - payment issue notification email not sent',
        );
      }
    } catch (emailError: any) {
      logger.error(
        `Failed to send payment issue notification email for submission ${submissionId}: ${safeStringify(emailError)}`,
      );
      // Don't fail the API call if email sending fails
    }

    logger.info(
      `Payment issue reported for submission ID: ${submissionId} by user ID: ${userId}`,
    );
    return res.status(200).json({
      message: 'Payment issue reported successfully',
      success: true,
    });
  } catch (error: any) {
    logger.error(
      `Error reporting payment issue for submission ${submissionId}: ${safeStringify(
        error,
      )}`,
    );
    return res.status(500).json({
      error: error.message,
      message: `Error occurred while reporting payment issue for submission ${submissionId}.`,
    });
  }
}

export default withAuth(handler);
