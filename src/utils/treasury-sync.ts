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
  milestoneId: string,
): Promise<TreasurySyncResult> {
  try {
    const currentMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        submission: {
          select: {
            listing: {
              include: {
                sponsor: true,
              },
            },
          },
        },
      },
    });

    if (!currentMilestone) {
      logger.warn(`Milestone with ID ${milestoneId} not found`);
      return {
        success: false,
        error: 'Milestone not found',
        message: `Milestone with ID ${milestoneId} not found.`,
      };
    }

    const paymentDetails = currentMilestone.paymentDetails as any;
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
      logger.debug(`Milestone with ID: ${milestoneId} is already synced`);
      return {
        success: false,
        error: 'Treasury status is already synced',
        message: 'Treasury status is already synced for this submission',
      };
    }

    logger.debug(`Getting proposal status for milestone ID: ${milestoneId}`);
    const proposal = await getProposal(
      paymentDetails.treasury.dao,
      paymentDetails.treasury.proposalId,
    );

    const proposalStatus = await extractProposalStatusFromProposal(
      paymentDetails.treasury.dao,
      proposal,
    );

    if (proposalStatus === 'InProgress') {
      logger.debug(`Milestone with ID: ${milestoneId} is still in progress`);
      return {
        success: false,
        error: 'Treasury status is still in progress',
        status: proposalStatus,
      };
    }

    if (proposalStatus === 'Approved' && currentMilestone.status !== 'Paid') {
      logger.debug(`Updating milestone with ID: ${milestoneId} to paid status`);
      const result = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'Paid',
          paidDate: new Date(),
          paymentDetails: {
            link: paymentDetails.treasury.link,
          },
        },
        include: {
          submission: {
            select: {
              listingId: true,
              listing: {
                include: {
                  sponsor: true,
                  BountyCounts: true,
                },
              },
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
          listingId: result.submission.listingId,
          submissionId: result.submissionId,
          sponsorId: result.submission.listing.sponsor.id,
          milestoneId,
        },
      });

      const bounty = result.submission.listing;
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
            listingId: result.submission.listingId,
            sponsorId: result.submission.listing.sponsor.id,
          },
        });
      }

      logger.info(
        `Successfully updated milestone ID: ${milestoneId} to paid status`,
      );
      return {
        success: true,
        message: 'Treasury status synced successfully',
        status: proposalStatus,
      };
    } else if (proposalStatus === 'Rejected' || proposalStatus === 'Expired') {
      logger.debug(
        `Updating milestone with ID: ${milestoneId} to unpaid status`,
      );
      const milestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          paymentDetails: {
            treasury: {
              proposalId: paymentDetails.treasury.proposalId,
              dao: paymentDetails.treasury.dao,
              synced: true,
            },
          },
        },
        include: {
          submission: {
            include: {
              Milestones: true,
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
          listingId: currentMilestone.submission.listing.id,
          submissionId: currentMilestone.submissionId,
          sponsorId: currentMilestone.submission.listing.sponsor.id,
          milestoneId:
            milestone?.submission.Milestones.length &&
            milestone.submission.Milestones.length > 1
              ? milestone.id
              : undefined,
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
      `Error syncing treasury status for milestone ${milestoneId}: ${error.message}`,
    );
    return {
      success: false,
      error: error.message,
      message: `Error occurred while syncing treasury status for milestone ${milestoneId}.`,
    };
  }
}
