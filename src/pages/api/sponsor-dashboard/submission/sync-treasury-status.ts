import type { NextApiRequest, NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { extractProposalStatusFromProposal, getProposal } from '@/utils/near';
import { safeStringify } from '@/utils/safeStringify';

import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  logger.debug(`Request body: ${safeStringify(req.body)}`);
  const { id } = req.body;

  try {
    const currentSubmission = await prisma.submission.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            sponsor: true,
          },
        },
      },
    });

    if (!currentSubmission) {
      logger.warn(`Submission with ID ${id} not found`);
      return res.status(404).json({
        message: `Submission with ID ${id} not found.`,
      });
    }

    const paymentDetails = currentSubmission.paymentDetails as any;
    if (
      !paymentDetails?.treasury?.dao ||
      !paymentDetails?.treasury?.proposalId
    ) {
      logger.warn('No treasury proposal found for submission');
      return res.status(400).json({
        error: 'No treasury proposal found',
        message: 'No treasury proposal found for this submission',
      });
    }

    if (paymentDetails?.treasury?.synced) {
      logger.debug(`Submission with ID: ${id} is already synced`);
      return res.status(400).json({
        error: 'Treasury status is already synced',
        message: 'Treasury status is already synced for this submission',
      });
    }

    logger.debug(`Getting proposal status for submission ID: ${id}`);
    const proposal = await getProposal(
      paymentDetails.treasury.dao,
      paymentDetails.treasury.proposalId,
    );

    const proposalStatus = await extractProposalStatusFromProposal(
      paymentDetails.treasury.dao,
      proposal,
    );

    if (proposalStatus === 'InProgress') {
      logger.debug(`Submission with ID: ${id} is still in progress`);
      return res.status(400).json({
        error: 'Treasury status is still in progress',
      });
    }

    if (proposalStatus === 'Approved' && !currentSubmission.isPaid) {
      logger.debug(`Updating submission with ID: ${id} to paid status`);
      const result = await prisma.submission.update({
        where: { id },
        data: {
          isPaid: true,
          paymentDetails: {
            link: paymentDetails.treasury.link,
          },
        },
        include: {
          listing: {
            include: {
              BountyCounts: true,
            },
          },
        },
      });

      eventLogger.log({
        eventType: EventType.TREASURY_PROPOSAL_APPROVED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          proposalLink: paymentDetails.treasury.link,
        },
        entities: {
          listingId: currentSubmission.listingId,
          submissionId: id,
          sponsorId: currentSubmission.listing.sponsor.id,
        },
      });

      const bounty = result.listing;
      if (
        bounty &&
        bounty.isWinnersAnnounced &&
        bounty.BountyCounts.totalPaymentsMade ===
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
            listingId: currentSubmission.listingId,
            sponsorId: currentSubmission.listing.sponsor.id,
          },
        });
      }

      logger.info(`Successfully updated submission ID: ${id} to paid status`);
    } else if (proposalStatus === 'Rejected' || proposalStatus === 'Expired') {
      logger.debug(`Updating submission with ID: ${id} to unpaid status`);
      await prisma.submission.update({
        where: { id },
        data: {
          paymentDetails: {
            treasury: {
              proposalId: paymentDetails.treasury.proposalId,
              dao: paymentDetails.treasury.dao,
              synced: true,
            },
          },
        },
      });

      eventLogger.log({
        eventType:
          proposalStatus === 'Rejected'
            ? EventType.TREASURY_PROPOSAL_REJECTED
            : EventType.TREASURY_PROPOSAL_EXPIRED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          proposalLink: paymentDetails.treasury.link,
        },
        entities: {
          listingId: currentSubmission.listingId,
          submissionId: id,
          sponsorId: currentSubmission.listing.sponsor.id,
        },
      });
    }

    return res.status(200).json({
      message: 'Treasury status synced successfully',
      status: proposalStatus,
    });
  } catch (error: any) {
    logger.error(
      `Error syncing treasury status for submission ${id}: ${safeStringify(
        error,
      )}`,
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while syncing treasury status for submission ${id}.`,
    });
  }
}
