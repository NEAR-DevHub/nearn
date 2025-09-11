import { NotificationRelationType, type Prisma } from '@prisma/client';
import { type NextApiResponse } from 'next';

import { prisma } from '@/prisma';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';

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
          notificationRelationType: {
            not: NotificationRelationType.SPONSOR,
          },
        }
      : {};

  const talentFilter: Prisma.NotificationWhereInput =
    showTalent === 'false'
      ? {
          notificationRelationType: {
            not: NotificationRelationType.TALENT,
          },
        }
      : {};

  const whereClause: Prisma.NotificationWhereInput = {
    receiverId: req.userId,
    channel: 'inApp',
    AND: [readFilter, sponsorIdFilter, sponsorFilter, talentFilter],
  };

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    include: {
      submission: {
        select: {
          id: true,
          sequentialId: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      listing: {
        select: {
          id: true,
          sequentialId: true,
          slug: true,
          type: true,
          title: true,
          pocId: true,
          poc: {
            select: {
              username: true,
            },
          },
        },
      },
      sponsor: {
        select: {
          name: true,
          slug: true,
          logo: true,
        },
      },
      actor: {
        select: {
          username: true,
          name: true,
          photo: true,
          private: true,
        },
      },
      comment: {
        select: {
          id: true,
          author: {
            select: {
              username: true,
              name: true,
              photo: true,
              private: true,
            },
          },
          refType: true,
          type: true,
          message: true,
          repliedTo: {
            select: {
              id: true,
              authorId: true,
              author: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      },
      pow: {
        select: {
          id: true,
          userId: true,
        },
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

  return res.status(200).json({
    notifications: notifications.map((notification) => {
      return {
        ...notification,
        actor: {
          ...notification.actor,
          name: notification.actor?.private
            ? undefined
            : notification.actor?.name,
        },
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
