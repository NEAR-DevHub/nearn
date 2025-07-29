import { Prisma } from '@prisma/client';

import { prisma } from '@/prisma';
import { syncSubmissionTreasuryStatus } from '@/utils/treasury-sync';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function syncTreasuryPayments(): Promise<CronJobResult> {
  const logger = new CronLogger('sync-treasury-payments');
  const errors: string[] = [];
  let processed = 0;
  let synced = 0;

  try {
    logger.info('Starting treasury payments sync');

    const submissions = await prisma.submission.findMany({
      where: {
        isArchived: false,
        isActive: true,
        isPaid: false,
        isWinner: true,
        AND: [
          {
            paymentDetails: {
              not: Prisma.DbNull,
            },
          },
          {
            paymentDetails: {
              path: '$.treasury',
              not: Prisma.JsonNull,
            },
          },
          {
            OR: [
              {
                paymentDetails: {
                  path: '$.treasury.synced',
                  equals: false,
                },
              },
              {
                paymentDetails: {
                  path: '$.treasury.synced',
                  equals: Prisma.DbNull,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        listingId: true,
      },
    });

    logger.info(`Found ${submissions.length} submissions to sync`);

    // Process each submission
    for (const submission of submissions) {
      try {
        const result = await syncSubmissionTreasuryStatus(submission.id);
        processed++;

        if (result.success && result.status !== 'InProgress') {
          synced++;
          logger.info(`Synced submission ${submission.id}`, {
            status: result.status,
            listingId: submission.listingId,
          });
        } else if (
          !result.success &&
          result.error !== 'Treasury status is already synced' &&
          result.error !== 'Treasury status is still in progress'
        ) {
          // Only log as error if it's not already synced
          const errorMsg = `Failed to sync submission ${submission.id}: ${result.error}`;
          logger.error(errorMsg);
          errors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Failed to process submission ${submission.id}: ${error}`;
        logger.error(errorMsg, error);
        errors.push(errorMsg);
      }
    }

    logger.complete(processed, errors);

    return {
      success: true,
      message: `Processed ${processed} submissions, synced ${synced}`,
      processed,
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
