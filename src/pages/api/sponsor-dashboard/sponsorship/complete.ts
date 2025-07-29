import dayjs from 'dayjs';
import { type NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { isDeadlineOver } from '@/features/listings/utils/deadline';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const { listingId } = req.body;
  const userSponsorId = req.userSponsorId;
  try {
    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is missing' });
    }

    const { error } = await checkListingSponsorAuth(userSponsorId, listingId);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const listing = await prisma.bounties.findUnique({
      where: {
        id: listingId,
      },
      include: {
        BountyCounts: true,
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!isDeadlineOver(listing.deadline ?? undefined)) {
      return res
        .status(400)
        .json({ error: 'Listing is not in review or deadline is not over' });
    }

    const deadline = dayjs().isAfter(listing?.deadline)
      ? listing?.deadline
      : dayjs().subtract(2, 'minute').toISOString();

    logger.debug('Updating sponsorship details with winner announcement');
    const bounty = await prisma.bounties.update({
      where: { id: listingId },
      data: {
        isWinnersAnnounced: true,
        deadline,
        winnersAnnouncedAt: new Date().toISOString(),
      },
      include: {
        BountyCounts: true,
      },
    });

    eventLogger.log({
      eventType: EventType.LISTING_COMPLETED,
      actor: {
        id: userSponsorId as string,
        type: 'SPONSOR',
      },
      entities: {
        listingId: listingId,
        sponsorId: userSponsorId,
      },
      data: {},
    });

    eventLogger.log({
      eventType: EventType.SYSTEM_STATUS_CHANGED,
      actor: {
        type: 'SPONSOR',
      },
      data: {
        oldStatus: 'In Review',
        newStatus:
          bounty.BountyCounts.totalPaymentsMade !==
          bounty.BountyCounts.totalWinnersSelected
            ? 'Payment Pending'
            : 'Completed',
      },
      entities: {
        sponsorId: userSponsorId,
        listingId: listingId,
      },
    });

    return res.status(200).json({ message: 'Listing closed' });
  } catch (error: any) {
    logger.error(
      `Sponsor ${userSponsorId} unable to complete a sponsorship: ${safeStringify(error)}`,
    );
    return res.status(400).json({
      error: error.message,
      message: 'Error occurred while completing a sponsorship.',
    });
  }
}

export default withSponsorAuth(handler);
