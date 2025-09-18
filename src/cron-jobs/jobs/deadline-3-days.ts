import { NotificationRelationType } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@/prisma';

import {
  createNotification,
  fetchSubmittersAndWatchers,
} from '@/features/notifications/services/notification-service';
import { NotificationType } from '@/features/notifications/types';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function deadline3Days(): Promise<CronJobResult> {
  const logger = new CronLogger('deadline-3-days');

  try {
    dayjs.extend(utc);
    const threeDaysFromNowStart = dayjs.utc().add(3, 'day').startOf('day');
    const threeDaysFromNowEnd = dayjs.utc().add(3, 'day').endOf('day');

    const listings = await prisma.bounties.findMany({
      where: {
        isPublished: true,
        isActive: true,
        isArchived: false,
        status: 'OPEN',
        isPrivate: false,
        deadline: {
          gte: threeDaysFromNowStart.toISOString(),
          lt: threeDaysFromNowEnd.toISOString(),
        },
        isWinnersAnnounced: false,
      },
      include: {
        poc: true,
      },
    });

    for (const listing of listings) {
      const checkLogs = await prisma.notification.findFirst({
        where: {
          listingId: listing.id,
          type: NotificationType.DEADLINE_IN_3_DAYS,
        },
      });

      if (checkLogs) continue;

      const listingSubscriptions = await fetchSubmittersAndWatchers(listing.id);
      await Promise.all(
        listingSubscriptions.map((user) =>
          createNotification(
            NotificationType.DEADLINE_IN_3_DAYS,
            NotificationRelationType.TALENT,
            user.id,
            {
              sponsorId: listing.sponsorId,
              listingId: listing.id,
            },
          ),
        ),
      );
    }

    return {
      success: true,
      message: 'Job completed successfully',
    };
  } catch (error) {
    logger.error('Job failed', error);
    return {
      success: false,
      message: `Job failed: ${error}`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
