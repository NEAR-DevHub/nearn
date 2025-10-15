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
  milestoneId: string;
  listingId: string;
  dateType: DateType;
  date: string;
}

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userSponsorId = req.userSponsorId;

  try {
    logger.debug(`Request body: ${safeStringify(req.body)}`);
    const { milestoneId, listingId, dateType, date } =
      req.body as UpdateDateRequest;

    if (!listingId || !milestoneId || !date || !dateType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['payment'].includes(dateType)) {
      return res.status(400).json({ error: 'Invalid date type' });
    }

    const { error } = await checkListingSponsorAuth(userSponsorId, listingId);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const milestone = await prisma.milestone.findUnique({
      where: {
        id: milestoneId,
      },
    });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Validate based on date type
    if (dateType === 'payment' && milestone.status !== 'Paid') {
      return res.status(400).json({ error: 'Milestone is not marked as paid' });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: {
        id: milestoneId,
      },
      data: {
        paidDate: new Date(date),
      },
    });

    eventLogger.log({
      eventType: EventType.SUBMISSION_PAYMENT_DATE_EDITED,
      actor: {
        id: req.userId as string,
        type: 'SPONSOR',
      },
      data: {
        before: milestone.paidDate,
        after: new Date(date),
      },
      entities: {
        listingId: listingId,
        submissionId: milestone.submissionId,
        sponsorId: userSponsorId,
      },
    });

    logger.info(
      `Updated ${dateType} date for milestone ID: ${milestoneId} to ${date}`,
    );

    return res.status(200).json({ milestone: updatedMilestone });
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
