import { type Comment, EventVisibility } from '@prisma/client';
import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

type CommentWithRelations = Comment & {
  listing?: {
    sponsorId: string;
  };
  submission?: {
    listing?: {
      sponsorId: string;
    };
  };
  pow?: {
    userId: string;
  };
};

const isAuthorized = (
  comment: CommentWithRelations,
  req: NextApiRequestWithPotentialSponsor,
) => {
  if (req.role === 'GOD') {
    return true;
  }

  if (comment.refType === 'BOUNTY') {
    return (
      req.sponsorIds &&
      comment.listing &&
      req.sponsorIds.includes(comment.listing.sponsorId)
    );
  } else if (comment.refType === 'SUBMISSION') {
    return (
      req.sponsorIds &&
      comment.submission &&
      comment.submission.listing &&
      req.sponsorIds.includes(comment.submission.listing.sponsorId)
    );
  } else if (comment.refType === 'POW') {
    return req.userId && comment.pow && comment.pow.userId === req.userId;
  }

  return false;
};

async function pinComment(
  req: NextApiRequestWithPotentialSponsor,
  res: NextApiResponse,
) {
  const params = req.query;
  const commentId = params.id as string;

  logger.info(`Request Params: ${safeStringify(req.query)}`);

  if (req.method !== 'POST') {
    logger.warn(`Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.authorized) {
    logger.warn('Unauthorized request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { action } = req.body;
    if (!action || !['pin', 'unpin'].includes(action)) {
      logger.warn('Invalid action parameter');
      return res
        .status(400)
        .json({ error: 'Invalid action. Must be "pin" or "unpin"' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        listing: {
          select: {
            id: true,
            sponsorId: true,
            pocId: true,
          },
        },
        submission: {
          select: {
            listing: {
              select: {
                id: true,
                sponsorId: true,
                pocId: true,
              },
            },
          },
        },
        pow: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!comment) {
      logger.warn(`Comment not found with ID: ${commentId}`);
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.replyToId) {
      logger.warn(
        `Comment is not a top-level comment and cannot be pinned/unpinned`,
      );
      return res
        .status(400)
        .json({ error: 'Only top-level comments can be pinned/unpinned' });
    }

    if (!isAuthorized(comment as CommentWithRelations, req)) {
      logger.warn(`Unauthorized pin attempt by user ID: ${req.userId}`);
      return res
        .status(403)
        .json({ error: 'Unauthorized to pin/unpin this comment' });
    }

    // Update the comment
    const pinnedAt = action === 'pin' ? new Date() : null;
    logger.debug(`${action}ning comment with ID: ${commentId}`);
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        pinnedAt,
      },
    });

    // Log the event
    if (
      updatedComment.refType === 'SUBMISSION' ||
      updatedComment.refType === 'BOUNTY'
    ) {
      const listingId =
        updatedComment.refType === 'SUBMISSION'
          ? comment?.submission?.listing?.id
          : comment?.listing?.id;
      const sponsorId =
        updatedComment.refType === 'SUBMISSION'
          ? comment?.submission?.listing?.sponsorId
          : comment?.listing?.sponsorId;

      eventLogger.log({
        eventType:
          action === 'pin'
            ? EventType.COMMENT_PINNED
            : EventType.COMMENT_UNPINNED,
        actor: {
          id: req.userId,
          type: 'SPONSOR',
        },
        data: {},
        entities: {
          listingId,
          submissionId:
            updatedComment.refType === 'SUBMISSION'
              ? updatedComment.refId
              : undefined,
          commentId,
          sponsorId,
        },
        visibility:
          comment?.type === 'INTERNAL_SUBMISSION_NOTES'
            ? EventVisibility.SPONSOR
            : undefined,
      });
    }

    logger.info(`Comment ${action}ned successfully by user ID: ${req.userId}`);
    return res.status(200).json({
      message: `Comment ${action}ned successfully.`,
      pinnedAt: updatedComment.pinnedAt,
    });
  } catch (error: any) {
    logger.error(
      `Error occurred while ${req.body?.action || 'pin/unpin'}ning a comment: ${safeStringify(error)}`,
    );
    return res.status(400).json({
      error: `Error occurred while ${req.body?.action || 'pin/unpin'}ning a comment.`,
      message: error.message,
    });
  }
}

export default withPotentialSponsorAuth(pinComment);
