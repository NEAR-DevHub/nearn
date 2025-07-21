import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';
import { nearTreasuryFormSchema } from '@/features/sponsor/utils/integrationsFormSchema';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;

  try {
    const userSponsorId = req.userSponsorId;

    if (!userSponsorId) {
      logger.warn(`User ${userId} does not have a current sponsor`);
      return res
        .status(403)
        .json({ error: 'User does not have a current sponsor' });
    }

    logger.debug(`Request body: ${safeStringify(req.body)}`);

    const validationResult = await nearTreasuryFormSchema.safeParseAsync(
      req.body,
    );

    if (!validationResult.success) {
      logger.warn(
        `Invalid integration data: ${safeStringify(validationResult.error)}`,
      );
      return res.status(400).json({
        error: 'Invalid integration data',
        details: validationResult.error.errors,
      });
    }

    const { nearTreasuryDao, nearTreasuryFrontend } = validationResult.data;

    const nearTreasury =
      !!nearTreasuryDao && !!nearTreasuryFrontend
        ? {
            dao: nearTreasuryDao!,
            frontend: nearTreasuryFrontend!,
          }
        : undefined;

    let loggingCallData;
    if (nearTreasury) {
      loggingCallData = {
        eventType: EventType.SPONSOR_TREASURY_ADDED,
        data: {
          dao: nearTreasury.dao,
          url: nearTreasury.frontend,
        },
      };
    } else {
      const result = await prisma.sponsors.findUnique({
        where: {
          id: userSponsorId,
        },
      });
      loggingCallData = {
        eventType: EventType.SPONSOR_TREASURY_REMOVED,
        data: {
          old_dao: (result?.nearTreasury as any)?.dao,
          old_url: (result?.nearTreasury as any)?.frontend,
        },
      };
    }

    const result = await prisma.sponsors.update({
      where: {
        id: userSponsorId,
      },
      data: {
        nearTreasury: nearTreasury ?? (null as any),
      },
    });

    await eventLogger.log({
      ...loggingCallData,
      actor: {
        id: userId as string,
        type: 'SPONSOR',
      },
      entities: {
        sponsorId: userSponsorId,
      },
    });

    logger.info(
      `Sponsor integrations updated successfully for user: ${userId}`,
    );
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `Error occurred while updating sponsor integrations for user ${userId}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message || 'Internal server error',
      message: 'Error occurred while updating sponsor integrations.',
    });
  }
}

export default withSponsorAuth(handler);
