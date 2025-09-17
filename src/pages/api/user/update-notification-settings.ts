import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithUser } from '@/features/auth/types';
import { withAuth } from '@/features/auth/utils/withAuth';

interface NotificationSettingInput {
  channel: string;
  type: string;
  sponsorId?: string | null;
  listingScope?: string | null;
}

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { settings } = req.body as { settings: NotificationSettingInput[] };
  const userId = req.userId;

  logger.debug(`Request body: ${safeStringify(req.body)}`);

  try {
    // Validate input
    if (!Array.isArray(settings)) {
      return res.status(400).json({ message: 'Settings must be an array' });
    }

    const validChannels = ['email', 'inApp'];
    const validListingScopes = ['mine', 'all'];

    for (const setting of settings) {
      if (!validChannels.includes(setting.channel)) {
        return res
          .status(400)
          .json({ message: `Invalid channel: ${setting.channel}` });
      }

      if (
        setting.listingScope &&
        !validListingScopes.includes(setting.listingScope)
      ) {
        return res
          .status(400)
          .json({ message: `Invalid listing scope: ${setting.listingScope}` });
      }

      if (!setting.type) {
        return res
          .status(400)
          .json({ message: 'Notification type is required' });
      }
    }

    // Delete existing notification settings for the user
    logger.debug(
      `Deleting existing notification settings for user ID: ${userId}`,
    );
    await prisma.notificationSettings.deleteMany({
      where: {
        userId: userId as string,
      },
    });

    // Create new notification settings
    logger.debug(
      `Creating new notification settings: ${safeStringify(settings)}`,
    );

    const createData = settings.map((setting) => ({
      userId: userId as string,
      channel: setting.channel,
      type: setting.type,
      sponsorId: setting.sponsorId || null,
      listingScope: setting.sponsorId ? setting.listingScope || 'mine' : null,
    }));

    await prisma.notificationSettings.createMany({
      data: createData,
    });

    // Remove from unsubscribed emails if user has enabled any email notifications
    const hasEmailNotifications = settings.some((s) => s.channel === 'email');
    if (hasEmailNotifications) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user?.email) {
        logger.debug(`Removing unsubscribe entry for email: ${user.email}`);
        await prisma.unsubscribedEmail.deleteMany({
          where: {
            email: user.email,
          },
        });
      }
    }

    logger.info(
      `Notification settings updated successfully for user ID: ${userId}`,
    );
    res
      .status(200)
      .json({ message: 'Notification settings updated successfully!' });
  } catch (error: any) {
    logger.error(
      `Failed to update notification settings for user ID: ${userId} - ${safeStringify(
        error,
      )}`,
    );
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
