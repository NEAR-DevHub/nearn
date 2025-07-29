import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { extractProposalStatusFromProposal, getProposal } from '@/utils/near';

import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

export interface TreasurySyncResult {
  success: boolean;
  status?: string;
  message?: string;
  error?: string;
}

export async function syncSubmissionTreasuryStatus(
  submissionId: string,
): Promise<TreasurySyncResult> {
  try {
    const currentSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        listing: {
          include: {
            sponsor: true,
          },
        },
      },
    });

    if (!currentSubmission) {
      logger.warn(`Submission with ID ${submissionId} not found`);
      return {
        success: false,
        error: 'Submission not found',
        message: `Submission with ID ${submissionId} not found.`,
      };
    }

    const paymentDetails = currentSubmission.paymentDetails as any;
    if (
      !paymentDetails?.treasury?.dao ||
      !paymentDetails?.treasury?.proposalId
    ) {
      logger.warn('No treasury proposal found for submission');
      return {
        success: false,
        error: 'No treasury proposal found',
        message: 'No treasury proposal found for this submission',
      };
    }

    if (paymentDetails?.treasury?.synced) {
      logger.debug(`Submission with ID: ${submissionId} is already synced`);
      return {
        success: false,
        error: 'Treasury status is already synced',
        message: 'Treasury status is already synced for this submission',
      };
    }

    logger.debug(`Getting proposal status for submission ID: ${submissionId}`);
    const proposal = await getProposal(
      paymentDetails.treasury.dao,
      paymentDetails.treasury.proposalId,
    );

    const proposalStatus = await extractProposalStatusFromProposal(
      paymentDetails.treasury.dao,
      proposal,
    );

    if (proposalStatus === 'InProgress') {
      logger.debug(`Submission with ID: ${submissionId} is still in progress`);
      return {
        success: false,
        error: 'Treasury status is still in progress',
        status: proposalStatus,
      };
    }

    if (proposalStatus === 'Approved' && !currentSubmission.isPaid) {
      logger.debug(
        `Updating submission with ID: ${submissionId} to paid status`,
      );
      const result = await prisma.submission.update({
        where: { id: submissionId },
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

      await eventLogger.log({
        eventType: EventType.TREASURY_PROPOSAL_APPROVED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          proposalLink: paymentDetails.treasury.link,
        },
        entities: {
          listingId: currentSubmission.listingId,
          submissionId: submissionId,
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
        await eventLogger.log({
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

      logger.info(
        `Successfully updated submission ID: ${submissionId} to paid status`,
      );
      return {
        success: true,
        message: 'Treasury status synced successfully',
        status: proposalStatus,
      };
    } else if (proposalStatus === 'Rejected' || proposalStatus === 'Expired') {
      logger.debug(
        `Updating submission with ID: ${submissionId} to unpaid status`,
      );
      await prisma.submission.update({
        where: { id: submissionId },
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

      await eventLogger.log({
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
          submissionId: submissionId,
          sponsorId: currentSubmission.listing.sponsor.id,
        },
      });

      return {
        success: true,
        message: 'Treasury status synced successfully',
        status: proposalStatus,
      };
    }

    return {
      success: true,
      message: 'No status change needed',
      status: proposalStatus,
    };
  } catch (error: any) {
    logger.error(
      `Error syncing treasury status for submission ${submissionId}: ${error.message}`,
    );
    return {
      success: false,
      error: error.message,
      message: `Error occurred while syncing treasury status for submission ${submissionId}.`,
    };
  }
}
