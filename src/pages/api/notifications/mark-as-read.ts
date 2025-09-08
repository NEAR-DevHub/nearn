import { type NextApiResponse } from 'next';

import { prisma } from '@/prisma';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';

async function markAsRead(
  req: NextApiRequestWithPotentialSponsor,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.authorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { notificationIds } = req.body;

  if (
    !notificationIds ||
    !Array.isArray(notificationIds) ||
    notificationIds.length === 0
  ) {
    return res.status(400).json({ error: 'notificationIds array is required' });
  }

  if (notificationIds.length > 100) {
    return res
      .status(400)
      .json({ error: 'Cannot mark more than 100 notifications at once' });
  }

  try {
    const updateResult = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: req.userId,
        deliveredAt: null,
      },
      data: {
        deliveredAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      markedCount: updateResult.count,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res
      .status(500)
      .json({ error: 'Failed to mark notifications as read' });
  }
}

export default withPotentialSponsorAuth(markAsRead);
