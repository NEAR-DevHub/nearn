import { NotificationRelationType } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@/prisma';

import { createNotification } from '@/features/notifications/services/notification-service';
import { NotificationType } from '@/features/notifications/types';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function deadlineExceededByWeek(): Promise<CronJobResult> {
  const logger = new CronLogger('deadline-exceeded-by-week');

  try {
    dayjs.extend(utc);
    const sevenDaysAgo = dayjs.utc().subtract(7, 'day').toISOString();
    const nineDaysAgo = dayjs.utc().subtract(9, 'day').toISOString();

    const listings = await prisma.bounties.findMany({
      where: {
        isPublished: true,
        isActive: true,
        isArchived: false,
        status: 'OPEN',
        deadline: {
          lt: sevenDaysAgo,
          gte: nineDaysAgo,
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
          type: NotificationType.DEADLINE_EXCEEDED_BY_WEEK,
        },
      });

      if (checkLogs) continue;

      createNotification(
        NotificationType.DEADLINE_EXCEEDED_BY_WEEK,
        NotificationRelationType.SPONSOR,
        'SPONSOR',
        {
          sponsorId: listing.sponsorId,
          listingId: listing.id,
        },
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
