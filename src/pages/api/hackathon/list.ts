import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { prisma } from '@/prisma';

export default async function hackathons(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const params = req.query;

  const token = await getToken({ req });

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = token.id;

  if (!userId) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const searchString = params.searchString as string;
  const take = params.take ? parseInt(params.take as string, 10) : 30;
  let finalHackathons = [];
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId as string,
      },
      select: {
        id: true,
        role: true,
      },
    });
    if (user && user?.role === 'GOD') {
      const whereSearch = searchString
        ? {
            name: {
              contains: searchString,
            },
          }
        : {};
      const hackathonsList = await prisma.hackathon.findMany({
        where: {
          ...whereSearch,
        },
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
        orderBy: {
          slug: 'asc',
        },
      });
      finalHackathons = hackathonsList.map((hackathon) => {
        return {
          value: hackathon.id,
          label: hackathon.name,
          hackathon: {
            ...hackathon,
            role: 'GOD MODE',
          },
        };
      });
    } else {
      const whereSearch = searchString
        ? {
            name: {
              contains: searchString,
            },
          }
        : {};
      const hackathonsList = await prisma.hackathon.findMany({
        where: {
          ...whereSearch,
        },
        orderBy: {
          announceDate: 'desc',
        },
        take,
      });
      finalHackathons = hackathonsList.map((hackathon) => {
        return {
          value: hackathon.id,
          label: hackathon.name,
          hackathon: {
            ...hackathon,
            role: 'GOD MODE',
          },
        };
      });
    }
    res.status(200).json(finalHackathons);
  } catch (error) {
    res.status(400).json({
      error,
      message: 'Error occurred while fetching hackathons',
    });
  }
}
