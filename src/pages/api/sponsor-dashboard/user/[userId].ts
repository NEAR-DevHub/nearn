import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  logger.debug(`Fetching user with ID: ${userId}`);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        photo: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('Successfully fetched user details');
    res.status(200).json(user);
  } catch (err: any) {
    logger.error(`Error fetching user: ${safeStringify(err)}`);
    res.status(400).json({ error: 'Error occurred while fetching user.' });
  }
}

export default withSponsorAuth(handler);
