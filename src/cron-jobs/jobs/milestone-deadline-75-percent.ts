import { MilestoneStatus, NotificationRelationType } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@/prisma';

import { createNotification } from '@/features/notifications/services/notification-service';
import { NotificationType } from '@/features/notifications/types';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function milestoneDeadline75Percent(): Promise<CronJobResult> {
  const logger = new CronLogger('milestone-deadline-75-percent');

  try {
    dayjs.extend(utc);
    const now = dayjs.utc();

    const milestones = await prisma.milestone.findMany({
      where: {
        status: {
          in: [MilestoneStatus.NotStarted, MilestoneStatus.InProgress],
        },
        deadline: {
          not: null,
          gt: now.toISOString(),
        },
        Notification: {
          none: {
            type: {
              in: [
                NotificationType.MILESTONE_DEADLINE_IS_COMING_UP,
                NotificationType.SPONSOR_MILESTONE_DEADLINE_IS_COMING_UP,
              ],
            },
          },
        },
      },
      include: {
        submission: {
          include: {
            user: true,
            listing: {
              include: {
                sponsor: true,
                poc: true,
              },
            },
          },
        },
      },
    });

    const errors: string[] = [];
    for (const milestone of milestones) {
      try {
        if (
          !milestone.deadline ||
          !milestone.submission ||
          !milestone.submission.listing
        ) {
          continue;
        }

        const createdAt = dayjs.utc(milestone.createdAt);
        const deadline = dayjs.utc(milestone.deadline);
        const totalDuration = deadline.diff(createdAt, 'millisecond');
        const elapsedTime = now.diff(createdAt, 'millisecond');
        const percentageComplete = (elapsedTime / totalDuration) * 100;

        if (percentageComplete >= 75) {
          await createNotification(
            NotificationType.MILESTONE_DEADLINE_IS_COMING_UP,
            NotificationRelationType.TALENT,
            milestone.submission.userId,
            {
              sponsorId: milestone.submission.listing.sponsorId,
              listingId: milestone.submission.listingId,
              submissionId: milestone.submissionId,
              milestoneId: milestone.id,
            },
          );

          await createNotification(
            NotificationType.SPONSOR_MILESTONE_DEADLINE_IS_COMING_UP,
            NotificationRelationType.SPONSOR,
            'SPONSOR',
            {
              sponsorId: milestone.submission.listing.sponsorId,
              listingId: milestone.submission.listingId,
              submissionId: milestone.submissionId,
              milestoneId: milestone.id,
            },
          );

          logger.info(
            `Created milestone deadline notifications for milestone ${milestone.id} (${percentageComplete.toFixed(1)}% complete)`,
          );
        }
      } catch (error) {
        const errorMsg = `Failed to process milestone ${milestone.id}: ${error instanceof Error ? error.message : String(error)}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const message = `Job completed. Processed ${milestones.length} milestones`;
    logger.info(message);

    return {
      success: errors.length === 0,
      message,
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
