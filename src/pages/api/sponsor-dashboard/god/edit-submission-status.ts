import { Prisma } from '@prisma/client';
import type { NextApiResponse } from 'next';

import { type SubmissionWithUser } from '@/interface/submission';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { fetchTokenUSDValue } from '@/utils/fetchTokenUSDValue';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { BONUS_REWARD_POSITION } from '@/features/listing-builder/constants';
import { sponsorshipSubmissionStatus } from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { type Rewards } from '@/features/listings/types';
import { eventLogger } from '@/features/logging/services/event-logger';
import {
  EventType,
  type PlatformAdminEditableSubmissionFields,
} from '@/features/logging/types/event-data';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.role !== 'GOD') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  logger.debug(`Request body: ${JSON.stringify(req.body)}`);
  const { id, status, label, isPaid, paymentLink } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Submission ID is required' });
  }

  try {
    const currentSubmission = await prisma.submission.findUnique({
      where: { id },
      include: { listing: true, user: true },
    });

    if (!currentSubmission) {
      logger.warn(`Submission with ID ${id} not found`);
      return res.status(404).json({
        message: `Submission with ID ${id} not found.`,
      });
    }

    const updateData: Prisma.SubmissionUpdateInput = {};

    if (status) {
      updateData.status = status;
    }

    if (label) {
      updateData.label = label;
    }

    if (currentSubmission.isPaid !== isPaid) {
      updateData.isPaid = isPaid;

      if (isPaid && paymentLink) {
        updateData.paymentDetails = {
          link: paymentLink,
        };
        updateData.paymentDate = new Date();
        updateData.paidByUser = {
          connect: {
            id: userId,
          },
        };
      }
    }

    const isRevertingFromApproved =
      currentSubmission.status === 'Approved' &&
      updateData.status &&
      updateData.status !== 'Approved';

    if (isRevertingFromApproved) {
      updateData.isPaid = false;
      updateData.paymentDetails = Prisma.JsonNull;
      updateData.paymentDate = null;
      updateData.paidByUser = {
        disconnect: true,
      };
      updateData.approvedByUser = {
        disconnect: true,
      };
      updateData.winnerPosition = null;
      updateData.isWinner = false;
    }

    const isApproving =
      status === 'Approved' && currentSubmission.status !== 'Approved';

    if (isApproving) {
      updateData.approveDate = new Date();
      updateData.approvedByUser = {
        connect: {
          id: userId,
        },
      };
      updateData.isWinner = true;
    }

    const result = await prisma.submission.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: { listing: true, user: true },
    });

    const oldRewards = currentSubmission.listing.rewards as Record<
      string,
      number
    >;
    if (isRevertingFromApproved) {
      const listing = currentSubmission.listing;

      if (listing.compensationType !== 'fixed' && currentSubmission.ask) {
        if (currentSubmission.winnerPosition) {
          const position = currentSubmission.winnerPosition.toString();
          const removedPosition = Number(currentSubmission.winnerPosition);
          const { [position]: removed, ...remainingRewards } = oldRewards;
          logger.debug(`Removed reward: ${removed}`);
          logger.debug(
            `Remaining rewards: ${JSON.stringify(remainingRewards)}`,
          );

          // Shift all rewards with position greater than the removed position down by 1 (skip bonus)
          const shiftedRewards = Object.entries(remainingRewards).reduce(
            (acc, [key, value]) => {
              const numericKey = Number(key);
              if (numericKey === BONUS_REWARD_POSITION) {
                acc[key] = value;
                return acc;
              }
              if (numericKey > removedPosition) {
                acc[String(numericKey - 1)] = value;
              } else {
                acc[key] = value;
              }
              return acc;
            },
            {} as Record<string, number>,
          );

          await prisma.$transaction([
            prisma.bounties.update({
              where: { id: listing.id },
              data: {
                rewards: shiftedRewards,
                rewardAmount: { decrement: removed },
                usdValue: { decrement: currentSubmission.rewardInUSD },
                updatedAt: new Date(),
              },
            }),
            prisma.submission.updateMany({
              where: {
                listingId: listing.id,
                isWinner: true,
                winnerPosition: {
                  gt: removedPosition,
                  not: BONUS_REWARD_POSITION,
                },
              },
              data: {
                winnerPosition: { decrement: 1 },
                updatedAt: new Date(),
              },
            }),
          ]);
        }
      }
    } else if (isApproving) {
      if (currentSubmission.listing.compensationType !== 'fixed') {
        logger.debug('Fetching token USD value for variable compensation');
        const tokenUSDValue =
          currentSubmission.listing.token === 'Any'
            ? 1
            : await fetchTokenUSDValue(
                currentSubmission.listing.token!,
                currentSubmission.listing.publishedAt!,
              );
        const usdValue = tokenUSDValue * (currentSubmission.ask || 0);
        const maxPosition = await prisma.submission.count({
          where: { listingId: currentSubmission.listingId, isWinner: true },
        });

        await prisma.bounties.update({
          where: { id: currentSubmission.listingId },
          data: {
            rewards: {
              ...(oldRewards as Rewards),
              // We already put him as a winner so we don't need to add + 1
              [maxPosition]: currentSubmission.ask,
            },
            rewardAmount: { increment: currentSubmission.ask || 0 },
            usdValue: { increment: usdValue },
            updatedAt: new Date(),
          },
        });

        await prisma.submission.update({
          where: { id },
          data: {
            winnerPosition: maxPosition + 1,
            isWinner: true,
            updatedAt: new Date(),
          },
        });
      }
    }

    const changes: Array<{
      field: PlatformAdminEditableSubmissionFields;
      oldValue: any;
      newValue: any;
    }> = [];
    const statusBefore = sponsorshipSubmissionStatus(
      currentSubmission as unknown as SubmissionWithUser,
    );
    const statusAfter = sponsorshipSubmissionStatus(
      result as unknown as SubmissionWithUser,
    );
    if (statusBefore !== statusAfter) {
      changes.push({
        field: 'status',
        oldValue: statusBefore,
        newValue: statusAfter,
      });
    }

    if (currentSubmission.paymentDetails !== result.paymentDetails) {
      changes.push({
        field: 'paymentDetails',
        oldValue: currentSubmission.paymentDetails,
        newValue: result.paymentDetails,
      });
    }

    if (changes.length > 0) {
      await eventLogger.log({
        eventType: EventType.PLATFORM_ADMIN_SUBMISSION_STATUS_EDITED,
        actor: {
          id: userId as string,
          type: 'PLATFORM_ADMIN',
        },
        entities: {
          submissionId: id,
          listingId: currentSubmission.listingId,
          sponsorId: currentSubmission.listing.sponsorId,
        },
        data: {
          changes,
        },
      });
    }

    logger.info(`Successfully updated submission status with ID: ${id}`);
    return res.status(200).json({
      message: 'Success',
      submission: result,
    });
  } catch (error: any) {
    logger.error(
      `User ${userId} unable to edit submission status: ${error.message}`,
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while updating submission ${id}.`,
    });
  }
}

export default withSponsorAuth(handler);
