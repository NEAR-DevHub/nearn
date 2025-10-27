import { prisma } from '@/prisma';

import {
  eventLogger,
  type Log,
} from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function checkMilestoneStatus(): Promise<CronJobResult> {
  const logger = new CronLogger('check-milestone-status');
  const errors: string[] = [];

  try {
    logger.info('Starting milestone status check');

    const milestonesToCheck = await prisma.milestone.findMany({
      where: {
        status: {
          in: ['NotStarted', 'InProgress'],
        },
        deadline: {
          lt: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        status: true,
        submissionId: true,
        submission: {
          select: {
            id: true,
            listingId: true,
            listing: {
              select: {
                sponsorId: true,
              },
            },
          },
        },
        EventLog: {
          where: {
            eventType: EventType.MILESTONE_STATUS_UPDATED,
            subType: 'OVERDUE',
          },
          select: {
            data: true,
            eventTime: true,
          },
        },
      },
    });

    const milestonesToTransition = milestonesToCheck
      .filter((milestone) => {
        if (!milestone.deadline) return false;

        // Check if we already logged an overdue event for this deadline
        const hasLogForCurrentDeadline = milestone.EventLog.some((log) => {
          const milestoneDeadlineTime = new Date(milestone.deadline!).getTime();
          const loggedDeadlineTime = new Date(log.eventTime).getTime();
          return milestoneDeadlineTime === loggedDeadlineTime;
        });

        return !hasLogForCurrentDeadline;
      })
      .map(
        (milestone) =>
          ({
            eventType: EventType.MILESTONE_STATUS_UPDATED,
            subType: 'OVERDUE',
            actor: {
              type: 'SYSTEM',
            },
            entities: {
              milestoneId: milestone.id,
              submissionId: milestone.submissionId,
              listingId: milestone.submission.listingId,
              sponsorId: milestone.submission.listing.sponsorId,
            },
            data: {
              previousStatus: milestone.status,
              newStatus: 'Overdue',
              deadline: milestone.deadline!,
            },
            eventTime: milestone.deadline!,
          }) as Log<EventType.MILESTONE_STATUS_UPDATED>,
      );

    logger.info(`Found ${milestonesToTransition.length} milestones to process`);

    await eventLogger.bulkLog(milestonesToTransition);

    logger.complete(milestonesToTransition.length, errors);

    return {
      success: true,
      message: `Processed ${milestonesToTransition.length} milestone status transitions`,
      processed: milestonesToTransition.length,
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
