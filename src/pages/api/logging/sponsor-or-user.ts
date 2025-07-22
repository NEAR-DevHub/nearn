import { type NextApiRequest, type NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, type } = req.query;

  if (!id || !type) {
    return res.status(400).json({
      message: 'ID and type are required in the query parameters.',
    });
  }

  if (!['sponsor', 'user'].includes(type as string)) {
    return res.status(400).json({
      message: 'Type must be either "sponsor" or "user".',
    });
  }

  try {
    switch (type) {
      case 'sponsor':
        const sponsor = await prisma.sponsors.findUnique({
          where: { id: id as string },
          select: {
            id: true,
            name: true,
            logo: true,
          },
        });
        if (!sponsor) {
          return res.status(404).json({
            message: 'Sponsor not found',
          });
        }
        return res.status(200).json({
          id: sponsor.id,
          name: sponsor.name,
          photo: sponsor.logo,
        });
      case 'user':
        const user = await prisma.user.findUnique({
          where: { id: id as string },
          select: {
            id: true,
            name: true,
            username: true,
            photo: true,
            private: true,
          },
        });

        if (!user) {
          return res.status(404).json({
            message: 'User not found',
          });
        }

        return res.status(200).json({
          id: user.id,
          photo: user.photo,
          name: user.private ? user.username : user.name,
        });
    }
  } catch (error: any) {
    logger.error(
      `Error fetching logs for id=${id} and type=${type}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
    });
  }
}
