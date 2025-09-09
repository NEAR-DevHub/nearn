import { type CommentRefType } from '@prisma/client';
import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithUser } from '@/features/auth/types';
import { withAuth } from '@/features/auth/utils/withAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

type CommentType = 'NORMAL' | 'SUBMISSION' | 'INTERNAL_SUBMISSION_NOTES';

async function comment(req: NextApiRequestWithUser, res: NextApiResponse) {
  const userId = req.userId;
  logger.debug(`Request body: ${safeStringify(req.body)}`);

  try {
    const { message, refId, replyToId, submissionId } = req.body;
    const refType = req.body.refType as CommentRefType;
    let { type } = req.body as { type: CommentType | undefined };
    if (!type) type = 'NORMAL';
    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (type === 'INTERNAL_SUBMISSION_NOTES') {
      const data = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          currentSponsorId: true,
        },
      });

      if (!data?.currentSponsorId) {
        return res.status(403).json({ error: 'User is not a sponsor' });
      }

      const submission = await prisma.submission.findUnique({
        where: {
          id: refId,
          listing: {
            sponsorId: data.currentSponsorId,
          },
        },
        select: {
          listingId: true,
        },
      });
      if (!submission) {
        return res
          .status(403)
          .json({ error: 'User is not a sponsor of this submission' });
      }
    }

    logger.debug('Creating a new comment in the database');
    const result = await prisma.comment.create({
      data: {
        authorId: userId as string,
        message: message as string,
        replyToId: replyToId as string | undefined,
        refId: refId as string,
        refType: refType as CommentRefType,
        type,
        submissionId: submissionId as string | undefined,
      },
      include: {
        repliedTo: {
          select: {
            authorId: true,
            author: {
              select: {
                username: true,
              },
            },
          },
        },
        author: {
          select: {
            name: true,
            photo: true,
            username: true,
            currentSponsorId: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                name: true,
                photo: true,
                username: true,
                currentSponsorId: true,
              },
            },
          },
        },
      },
    });
    let entities;
    if (refType === 'SUBMISSION') {
      const submissionListingId = await prisma.submission.findUnique({
        where: {
          id: refId,
        },
        select: {
          listingId: true,
          listing: {
            select: {
              sponsorId: true,
            },
          },
        },
      });
      entities = {
        submissionId: refId,
        listingId: submissionListingId?.listingId,
        sponsorId: submissionListingId?.listing?.sponsorId,
      };
    } else if (refType === 'BOUNTY') {
      const bountyListingId = await prisma.bounties.findUnique({
        where: {
          id: refId,
        },
        select: {
          sponsorId: true,
        },
      });
      entities = {
        listingId: refId,
        sponsorId: bountyListingId?.sponsorId,
      };
    } else if (refType === 'POW') {
      entities = {
        powId: refId,
      };
    }
    await eventLogger.log({
      eventType: EventType.COMMENT_ADDED,
      actor: {
        id: userId,
        type: type === 'INTERNAL_SUBMISSION_NOTES' ? 'SPONSOR' : 'USER',
      },
      data: {},
      entities: {
        ...entities,
        commentId: result.id,
      },
      visibility: type === 'INTERNAL_SUBMISSION_NOTES' ? 'SPONSOR' : undefined,
    });

    logger.info(`Comment added successfully by user ID: ${userId}`);
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `User ${userId} unable to add comment: ${safeStringify(error)}`,
    );
    return res.status(400).json({
      error,
      message: 'Error occurred while adding a new comment.',
    });
  }
}

export default withAuth(comment);
