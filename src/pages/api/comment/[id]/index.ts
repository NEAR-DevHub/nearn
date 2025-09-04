import { type CommentType } from '@prisma/client';
import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';
import { USERNAME_PATTERN } from '@/features/talent/constants';

async function comment(
  req: NextApiRequestWithPotentialSponsor,
  res: NextApiResponse,
) {
  logger.info(`Request Query: ${safeStringify(req.query)}`);

  const params = req.query;
  const refId = params.id as string;
  const skip = params.skip ? parseInt(params.skip as string, 10) : 0;
  const take = params.take ? parseInt(params.take as string, 10) : 0;
  const type = params.type ? (params.type as CommentType) : undefined;

  logger.debug(`Fetching comments for listingId=${refId}, skip=${skip}`);

  if (type === 'INTERNAL_SUBMISSION_NOTES') {
    const submission = await prisma.submission.findUnique({
      where: {
        id: refId,
        listing: {
          sponsorId: req.userSponsorId,
        },
      },
    });
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
  }

  try {
    const result = await prisma.comment.findMany({
      where: {
        refId,
        isActive: true,
        isArchived: false,
        replyToId: null,
        type: type
          ? type
          : {
              notIn: ['SUBMISSION', 'INTERNAL_SUBMISSION_NOTES'],
            },
      },
      orderBy: [
        {
          pinnedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      skip: skip ?? 0,
      take,
      include: {
        author: {
          select: {
            name: true,
            photo: true,
            username: true,
            currentSponsorId: true,
            private: true,
          },
        },
        replies: {
          where: {
            isActive: true,
            isArchived: false,
          },
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const commentsCount = await prisma.comment.count({
      where: {
        refId,
        isActive: true,
        isArchived: false,
        replyToId: null,
        type: type
          ? type
          : {
              notIn: ['SUBMISSION', 'INTERNAL_SUBMISSION_NOTES'],
            },
      },
    });

    const mentionedUsernames = extractUsernames(result);
    const validUsernames = await prisma.user.findMany({
      where: {
        username: {
          in: Array.from(mentionedUsernames),
        },
      },
      select: {
        username: true,
      },
    });

    logger.info(
      `Fetched ${result.length} comments and count=${commentsCount} for listingId=${refId}`,
    );

    res.status(200).json({
      count: commentsCount,
      result: result.map((comment) => ({
        ...comment,
        author: {
          ...comment.author,
          name: comment.author?.private ? undefined : comment.author?.name,
        },
      })),
      validUsernames: validUsernames
        .map((user) => user.username)
        .filter(Boolean),
    });
  } catch (error: any) {
    logger.error(
      `Error occurred while fetching comments for listingId=${refId}: ${safeStringify(error)}`,
    );
    res.status(400).json({
      error: 'Error occurred while fetching comments.',
      message: `Error occurred while fetching bounty with listingId=${refId}.`,
    });
  }
}

function extractUsernames(comments: any[]): Set<string> {
  const usernames = new Set<string>();

  const processMessage = (message: string) => {
    const matches = message.match(/@([\w-]+)/g);
    if (matches) {
      matches.forEach((match) => {
        const username = match.slice(1);
        if (username && USERNAME_PATTERN.test(username)) {
          usernames.add(username);
        }
      });
    }
  };

  comments.forEach((comment) => {
    processMessage(comment.message);
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach((reply: any) => {
        processMessage(reply.message);
      });
    }
  });

  return usernames;
}

export default withPotentialSponsorAuth(comment);
