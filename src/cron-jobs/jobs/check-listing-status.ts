import { prisma } from '@/prisma';

import {
  eventLogger,
  type Log,
} from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function checkListingStatus(): Promise<CronJobResult> {
  const logger = new CronLogger('check-listing-status');
  const errors: string[] = [];

  try {
    logger.info('Starting listing status check');

    // Find all bounties that are open and deadline passed
    const bountiesToCheck = await prisma.bounties.findMany({
      where: {
        status: 'OPEN',
        deadline: {
          lt: new Date(),
        },
        isPublished: true,
        isActive: true,
        isArchived: false,
        isWinnersAnnounced: false,
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        sponsorId: true,
        EventLog: {
          where: {
            eventType: EventType.SYSTEM_STATUS_IN_REVIEW,
          },
          select: {
            data: true,
          },
        },
      },
    });

    const bountiesToTransition = bountiesToCheck
      .filter((bounty) => {
        if (!bounty.deadline) return false;

        const hasLogForCurrentDeadline = bounty.EventLog.some((log) => {
          const loggedDeadline = (log.data as any)?.deadline;
          if (!loggedDeadline) return false;

          // Compare deadline timestamps
          const bountyDeadlineTime = new Date(bounty.deadline!).getTime();
          const loggedDeadlineTime = new Date(loggedDeadline).getTime();
          return bountyDeadlineTime === loggedDeadlineTime;
        });

        return !hasLogForCurrentDeadline;
      })
      .map(
        (bounty) =>
          ({
            eventType: EventType.SYSTEM_STATUS_IN_REVIEW,
            actor: {
              type: 'SYSTEM',
            },
            entities: {
              listingId: bounty.id,
              sponsorId: bounty.sponsorId,
            },
            data: {
              deadline: bounty.deadline!,
            },
            eventTime: bounty.deadline!,
          }) as Log<EventType.SYSTEM_STATUS_IN_REVIEW>,
      );

    logger.info(`Found ${bountiesToTransition.length} bounties to process`);

    await eventLogger.bulkLog(bountiesToTransition);

    logger.complete(bountiesToTransition.length, errors);

    return {
      success: true,
      message: `Processed ${bountiesToTransition.length} status transitions`,
      processed: bountiesToTransition.length,
      errors: errors.length > 0 ? errors : undefined,
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
