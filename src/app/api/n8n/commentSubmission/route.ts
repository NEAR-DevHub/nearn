import { NextResponse } from 'next/server';

import { verifyCronSecret } from '@/cron-jobs/lib/auth';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { sendEmailNotification } from '@/features/emails/utils/sendEmailNotification';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await request.json();
    logger.debug(`Request body: ${safeStringify(requestBody)}`);

    const { message, submissionId } = requestBody;

    if (!message || !submissionId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, submissionId' },
        { status: 400 },
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        listing: {
          include: {
            poc: true,
            sponsor: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: `No submission found with ID: ${submissionId}` },
        { status: 404 },
      );
    }

    logger.debug('Creating a new comment in the database');
    const result = await prisma.comment.create({
      data: {
        message: message as string,
        refId: submissionId,
        refType: 'SUBMISSION',
        type: 'NORMAL',
      },
    });

    eventLogger.log({
      eventType: EventType.COMMENT_ADDED,
      actor: {
        type: 'SYSTEM',
      },
      data: {},
      entities: {
        submissionId,
        listingId: submission.listing.id,
        commentId: result.id,
        sponsorId: submission.listing.sponsor.id,
      },
    });

    const taggedUsernames = (message as string)
      .split(' ')
      .filter((tag) => tag.startsWith('@'))
      .map((tag) => tag.substring(1));
    const taggedUsers = await prisma.user.findMany({
      select: {
        id: true,
      },
      where: {
        AND: [
          {
            username: {
              in: taggedUsernames,
            },
          },
          {
            NOT: {
              id: submission.listing.sponsor.id,
            },
          },
        ],
      },
    });

    try {
      if (taggedUsers.length > 0) {
        logger.debug('Sending email notifications to tagged users');
        for (const taggedUser of taggedUsers) {
          sendEmailNotification({
            type: 'commentTag',
            id: submissionId,
            userId: taggedUser.id,
            otherInfo: {
              personName: submission.listing.poc.name,
              type: 'SUBMISSION',
            },
            triggeredBy: submission.listing.poc.id,
          });
        }
      }

      logger.info(`Sending email notification for activity comment`);
      sendEmailNotification({
        type: 'commentActivity',
        id: submissionId,
        otherInfo: {
          personName: submission.listing.poc.name,
          type: 'SUBMISSION',
        },
        triggeredBy: submission.listing.sponsor.id,
      });
    } catch (err) {
      logger.error(`Error Sending Email Notifications - ${err}`);
    }

    logger.info(
      `Comment added successfully by sponsor ID: ${submission.listing.sponsor.id}`,
    );
    return NextResponse.json(
      { success: true, comment: result },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error(`Sponsor unable to add comment: ${safeStringify(error)}`);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error
            ? error.message
            : 'Error occurred while adding a new comment.',
      },
      { status: 500 },
    );
  }
}
