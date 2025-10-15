import { type NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';
import { type VerifyPaymentsFormData } from '@/features/sponsor-dashboard/types';

export const config = {
  maxDuration: 300,
};

export type ValidatePaymentResult = {
  milestoneId: string;
  link?: string;
  status: 'SUCCESS' | 'FAIL' | 'ALREADY_VERIFIED';
  message?: string;
  transactionDate?: Date;
};

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userSponsorId = req.userSponsorId;

  try {
    logger.debug(`Request body: ${safeStringify(req.body)}`);
    let { paymentLinks } = req.body as VerifyPaymentsFormData;
    const { listingId } = req.body as VerifyPaymentsFormData & {
      listingId: string;
    };

    paymentLinks = paymentLinks.filter((p) => !!p.link);

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is missing' });
    }

    const { error } = await checkListingSponsorAuth(userSponsorId, listingId);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const listing = await prisma.bounties.findUnique({
      where: {
        id: listingId,
      },
      include: {
        BountyCounts: true,
      },
    });

    if (!listing) return res.status(400).json({ error: 'Listing not found' });

    if (!listing.isWinnersAnnounced && listing.type !== 'sponsorship')
      return res.status(400).json({ error: 'Listing not announced' });

    const validationResults: ValidatePaymentResult[] = [];

    for (const paymentLink of paymentLinks) {
      try {
        logger.debug(
          `Force verifying payment for milestone ID: ${paymentLink.milestoneId}`,
        );

        if (paymentLink.isVerified) {
          validationResults.push({
            milestoneId: paymentLink.milestoneId,
            link: paymentLink.link,
            status: 'ALREADY_VERIFIED',
            message: 'Already Verified',
          });
          continue;
        }

        validationResults.push({
          milestoneId: paymentLink.milestoneId,
          link: paymentLink.link,
          status: 'SUCCESS',
        });

        logger.info(
          `Force Payment Verification Successful for Milestone ID: ${paymentLink.milestoneId}`,
        );
      } catch (error: any) {
        validationResults.push({
          milestoneId: paymentLink.milestoneId,
          link: paymentLink.link,
          status: 'FAIL',
          message: error.message,
        });
        logger.warn(
          `Force Payment Verification Failed for Milestone ID: ${paymentLink.milestoneId} with message: ${error.message}`,
        );
      }
    }

    for (const validationResult of validationResults) {
      if (validationResult.status !== 'SUCCESS') continue;

      logger.debug(
        `Updating milestone with ID: ${validationResult.milestoneId} with new external payment details`,
      );
      await prisma.milestone.update({
        where: {
          id: validationResult.milestoneId,
        },
        data: {
          status: 'Paid',
          paymentDetails: { link: validationResult.link },
          paidDate: new Date(),
          paidBy: req.userId,
        },
      });

      const milestone = await prisma.milestone.findUnique({
        where: {
          id: validationResult.milestoneId,
        },
      });

      eventLogger.log({
        eventType: EventType.SUBMISSION_PAID,
        actor: {
          id: req.userId as string,
          type: 'SPONSOR',
        },
        data: {
          link: validationResult.link as string,
        },
        entities: {
          listingId: listingId,
          submissionId: milestone?.submissionId || '',
          sponsorId: userSponsorId,
        },
      });
    }

    const bounty = await prisma.bounties.findUnique({
      where: {
        id: listingId,
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
          listingId: listingId,
          sponsorId: userSponsorId,
        },
      });
    }

    logger.debug(
      `Updating listing with ID: ${listingId} with new totalPaymentsMade`,
    );

    return res.status(200).json({ validationResults });
  } catch (err: any) {
    logger.error(
      `Error force verifying payments: ${userSponsorId}: ${err.message}`,
    );
    res.status(400).json({
      err: `Error force verifying payments`,
    });
  }
}

export default withSponsorAuth(handler);
