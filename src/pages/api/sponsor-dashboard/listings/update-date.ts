import { type NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

type DateType = 'payment' | 'approved';

interface UpdateDateRequest {
  submissionId: string;
  listingId: string;
  dateType: DateType;
  date: string;
}

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userSponsorId = req.userSponsorId;

  try {
    logger.debug(`Request body: ${safeStringify(req.body)}`);
    const { submissionId, listingId, dateType, date } =
      req.body as UpdateDateRequest;

    if (!listingId || !submissionId || !date || !dateType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['payment'].includes(dateType)) {
      return res.status(400).json({ error: 'Invalid date type' });
    }

    const { error } = await checkListingSponsorAuth(userSponsorId, listingId);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Validate based on date type
    if (dateType === 'payment' && !submission.isPaid) {
      return res
        .status(400)
        .json({ error: 'Submission is not marked as paid' });
    }

    const updatedSubmission = await prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        paymentDate: new Date(date),
      },
    });

    eventLogger.log({
      eventType: EventType.SUBMISSION_PAYMENT_DATE_EDITED,
      actor: {
        id: req.userId as string,
        type: 'SPONSOR',
      },
      data: {
        before: submission.paymentDate,
        after: new Date(date),
      },
      entities: {
        listingId: listingId,
        submissionId: submissionId,
        sponsorId: userSponsorId,
      },
    });

    logger.info(
      `Updated ${dateType} date for submission ID: ${submissionId} to ${date}`,
    );

    return res.status(200).json({ submission: updatedSubmission });
  } catch (err: any) {
    logger.error(
      `Error updating ${req.body?.dateType || 'unknown'} date: ${userSponsorId}: ${err.message}`,
    );
    res.status(400).json({
      error: `Error updating ${req.body?.dateType || 'unknown'} date`,
    });
  }
}

export default withSponsorAuth(handler);
