import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithUser } from '@/features/auth/types';
import { withAuth } from '@/features/auth/utils/withAuth';
import { isDeadlineOver } from '@/features/listings/utils/deadline';
import { submissionSchema } from '@/features/listings/utils/submissionFormSchema';
import { validateSubmissionRequest } from '@/features/listings/utils/validateSubmissionRequest';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

async function createSubmission(
  userId: string,
  listingId: string,
  data: any,
  listing: any,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const validationResult = submissionSchema(
    listing,
    listing.minRewardAsk || 0,
    listing.maxRewardAsk || 0,
    user as any,
  ).safeParse(data);

  if (!validationResult.success) {
    throw new Error(JSON.stringify(validationResult.error.formErrors));
  }

  const validatedData = validationResult.data;
  const allowMultipleSubmissions = listing.submissionLimit === 'multiple';

  if (validatedData.publicKey) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        publicKey: validatedData.publicKey,
      },
    });
  }

  const existingSubmissions = await prisma.submission.findMany({
    where: { userId, listingId },
  });

  if (!allowMultipleSubmissions && existingSubmissions.length > 0)
    throw new Error('User already has an active submission');

  if (
    allowMultipleSubmissions &&
    existingSubmissions.some((submission) => submission.label === 'Spam')
  )
    throw new Error('User submissions has been flagged as spam');

  if (
    allowMultipleSubmissions &&
    listing.multipleSubmissionRule === 'afterReview' &&
    !existingSubmissions.every((submission) => submission.status !== 'Pending')
  )
    throw new Error('User already has an active submission');

  const sequentialId = await prisma.sponsors.update({
    where: { id: listing.sponsorId },
    data: { submissionCounter: { increment: 1 } },
    select: { submissionCounter: true },
  });

  const result = await prisma.submission.create({
    data: {
      userId,
      listingId,
      link: validatedData.link || '',
      tweet: validatedData.tweet || '',
      title: validatedData.title || '',
      otherInfo: validatedData.otherInfo || '',
      eligibilityAnswers: validatedData.eligibilityAnswers || [],
      ask: validatedData.ask || null,
      token: validatedData.token || null,
      otherTokenDetails: validatedData.otherTokenDetails || null,
      sequentialId: sequentialId.submissionCounter,
    },
    include: {
      listing: {
        select: { pocId: true },
      },
    },
  });
  eventLogger.log({
    eventType: EventType.SUBMISSION_CREATED,
    actor: {
      id: userId,
      type: 'TALENT',
    },
    entities: {
      listingId,
      sponsorId: listing.sponsorId,
      submissionId: result.id,
    },
    data: {},
  });
  return result;
}

async function submission(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { userId } = req;
  const {
    listingId,
    link,
    tweet,
    title,
    otherInfo,
    eligibilityAnswers,
    ask,
    publicKey,
    token,
    otherTokenDetails,
  } = req.body;

  logger.debug(`Request body: ${safeStringify(req.body)}`);
  logger.debug(`User: ${safeStringify(userId)}`);

  try {
    const { listing } = await validateSubmissionRequest(
      userId as string,
      listingId,
      false,
    );

    if (isDeadlineOver(listing.deadline ?? undefined)) {
      return res.status(400).json({
        error: 'Deadline has passed',
        message: 'Deadline has passed',
      });
    }

    const result = await createSubmission(
      userId as string,
      listingId,
      {
        link,
        tweet,
        title,
        otherInfo,
        eligibilityAnswers,
        ask,
        publicKey,
        token,
        otherTokenDetails,
      },
      listing,
    );

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message.includes('Validation') ? 400 : 403;
    logger.error(`User ${userId} unable to submit: ${safeStringify(error)}`);

    return res.status(statusCode).json({
      error: error.message,
      message: `User ${userId} unable to submit: ${error.message}`,
    });
  }
}

export default withAuth(submission);
