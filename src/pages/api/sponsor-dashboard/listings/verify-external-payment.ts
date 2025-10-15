import { type NextApiResponse } from 'next';

import { tokenList } from '@/constants/tokenList';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';
import {
  type ValidatePaymentResult,
  type VerifyPaymentsFormData,
} from '@/features/sponsor-dashboard/types';
import { validatePayment } from '@/features/sponsor-dashboard/utils/paymentRPCValidation';

async function wait(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

export const config = {
  maxDuration: 300,
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
    const milestones = await prisma.milestone.findMany({
      where: {
        id: {
          in: paymentLinks.map((d) => d.milestoneId),
        },
        NOT: {
          status: 'Paid',
        },
      },
      include: {
        submission: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!listing) return res.status(400).json({ error: 'Listing not found' });

    if (!listing.isWinnersAnnounced && listing.type !== 'sponsorship')
      return res.status(400).json({ error: 'Listing not announced' });

    const validationResults: ValidatePaymentResult[] = [];

    for (const paymentLink of paymentLinks) {
      try {
        logger.debug(
          `Beginning External Payment Verification for milestone ID: ${paymentLink.milestoneId} with TxId: ${paymentLink.txId}`,
        );
        const milestone = milestones.find(
          (m) => m.id === paymentLink.milestoneId,
        );

        if (paymentLink.isVerified) {
          validationResults.push({
            milestoneId: paymentLink.milestoneId,
            submissionId: milestone?.submissionId || '',
            txId: paymentLink.txId,
            link: paymentLink.link || '',
            status: 'ALREADY_VERIFIED',
            message: 'Already Verified',
          });
          continue;
        }

        if (!milestone) throw new Error('Milestone not found');

        const isUSDbased = listing.token === 'Any';
        const tokenSymbol = milestone.token;
        const isOtherToken = tokenSymbol === 'Other';

        if (!paymentLink.txId && !isOtherToken) {
          throw new Error('Invalid URL');
        }

        const {
          user: { publicKey },
          winnerPosition,
        } = milestone.submission;

        if (!winnerPosition) {
          logger.error('Milestone has no winner position');
          throw new Error('Milestone has no winner position');
        }

        const winnerReward = (listing.rewards as Record<string, any>)?.[
          winnerPosition + ''
        ] as number;
        if (!winnerReward) {
          logger.error('Winner Position has no reward');
          throw new Error('Winner Position has no reward');
        }

        const dbToken = tokenList.find((t) => t.tokenSymbol === tokenSymbol);
        if (!dbToken) {
          return res
            .status(400)
            .json({ error: "Token doesn't exist for this listing" });
        }

        const validationResult = !isOtherToken
          ? await validatePayment({
              txId: paymentLink.txId,
              recipientPublicKey: publicKey!,
              expectedAmount: winnerReward,
              tokenMint: dbToken,
              isUSDbased,
            })
          : {
              isValid: true,
            };

        if (!validationResult.isValid) {
          throw new Error(`Failed (${validationResult.error})`);
        }
        validationResults.push({
          milestoneId: paymentLink.milestoneId,
          submissionId: milestone?.submissionId || '',
          txId: paymentLink.txId,
          link: paymentLink.link || '',
          transactionDate: validationResult.transactionDate,
          status: 'SUCCESS',
        });

        logger.info(
          `External Payment Validation Successful for Milestone ID: ${paymentLink.milestoneId} with TxId: ${paymentLink.txId}`,
        );
        await wait(5000);
      } catch (error: any) {
        const milestone = milestones.find(
          (m) => m.id === paymentLink.milestoneId,
        );
        validationResults.push({
          milestoneId: paymentLink.milestoneId,
          submissionId: milestone?.submissionId || '',
          txId: paymentLink.txId || '',
          link: paymentLink.link || '',
          status: 'FAIL',
          message: error.message,
        });
        await wait(5000);
        logger.warn(
          `External Payment Verification Failed for Milestone ID: ${paymentLink.milestoneId} with TxId: ${paymentLink.txId} with message: ${error.message}`,
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
          paymentDetails: {
            txId: validationResult.txId,
            link: validationResult.link,
          },
          paidDate: validationResult.transactionDate,
          paidBy: req.userId,
        },
      });

      eventLogger.log({
        eventType: EventType.SUBMISSION_PAID,
        actor: {
          id: req.userId as string,
          type: 'SPONSOR',
        },
        data: {
          link: validationResult.link,
        },
        entities: {
          listingId: listingId,
          submissionId: validationResult.submissionId,
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
      `Error verifying external payments: ${userSponsorId}: ${err.message}`,
    );
    res.status(400).json({
      err: `Error verifying external payments`,
    });
  }
}

export default withSponsorAuth(handler);
