import { type Prisma } from '@prisma/client';
import { type NextApiResponse } from 'next';

import { prisma } from '@/prisma';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';
import {
  type Log,
  prepareLogData,
  prismaLogInclude,
} from '@/features/logging/queries';

async function notifications(
  req: NextApiRequestWithPotentialSponsor,
  res: NextApiResponse,
) {
  const {
    page,
    limit,
    read,
    sponsorIds: sponsorIdsQuery,
    showSponsors,
    showTalent,
  } = req.query;

  const sponsorIds =
    sponsorIdsQuery && Array.isArray(sponsorIdsQuery)
      ? sponsorIdsQuery
      : sponsorIdsQuery
        ? [sponsorIdsQuery]
        : undefined;

  if (!req.authorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const pageNumber = parseInt(page as string) || 1;
  const limitNumber = parseInt(limit as string) || 10;
  const readFilter: Prisma.NotificationWhereInput =
    read === 'true'
      ? {
          deliveredAt: {
            not: null,
          },
        }
      : {
          deliveredAt: null,
        };
  const sponsorIdFilter: Prisma.NotificationWhereInput =
    sponsorIds && sponsorIds.length > 0
      ? {
          sponsorId: {
            in: sponsorIds as string[],
          },
        }
      : {};

  const sponsorFilter: Prisma.NotificationWhereInput =
    showSponsors === 'false'
      ? {
          sponsorId: null,
        }
      : {};

  const talentFilter: Prisma.NotificationWhereInput =
    showTalent === 'false'
      ? {
          sponsorId: {
            not: null,
          },
        }
      : {};

  const whereClause: Prisma.NotificationWhereInput = {
    userId: req.userId,
    channel: 'inApp',
    AND: [readFilter, sponsorIdFilter, sponsorFilter, talentFilter],
  };

  console.log(JSON.stringify(whereClause, null, 2));

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    include: {
      event: {
        include: prismaLogInclude,
      },
    },
    skip: (pageNumber - 1) * limitNumber,
    take: limitNumber,
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });

  const totalCount = await prisma.notification.count({
    where: whereClause,
  });

  const isGod = req.role === 'GOD';
  const visibility = isGod
    ? 'PLATFORM_ADMIN'
    : req.userSponsorId
      ? 'SPONSOR'
      : 'TALENT';

  return res.status(200).json({
    notifications: notifications.map((notification) => {
      return {
        ...notification,
        event: prepareLogData(notification.event as unknown as Log, visibility),
      };
    }),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      hasNextPage: pageNumber < Math.ceil(totalCount / limitNumber),
    },
  });
}

export default withPotentialSponsorAuth(notifications);
