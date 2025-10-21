import { type EventVisibility, type Prisma } from '@prisma/client';
import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';
import {
  type Log,
  prepareLogData,
  prismaLogInclude,
} from '@/features/logging/queries';
import {
  type EventType,
  isRoleAtLeast,
} from '@/features/logging/types/event-data';

type RefType = 'submission' | 'listing' | 'sponsor' | 'milestone';

async function getAuthorizedVisibility(
  userId: string,
  refType: RefType,
  refId: string,
): Promise<EventVisibility> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
    select: {
      role: true,
      UserSponsors: true,
    },
  });

  if (!user) {
    return 'PUBLIC';
  }

  if (user?.role === 'GOD') {
    return 'PLATFORM_ADMIN';
  }

  const userSponsors = user.UserSponsors.map((sponsor) => sponsor.sponsorId);

  switch (refType) {
    case 'milestone':
    case 'submission':
      const whereClause =
        refType === 'milestone'
          ? ({
              Milestones: {
                Some: {
                  id: refId,
                },
              },
            } as Prisma.SubmissionWhereInput)
          : {
              id: refId,
            };
      const submission = await prisma.submission.findFirst({
        where: {
          ...whereClause,
        },
        include: {
          listing: {
            select: {
              sponsorId: true,
            },
          },
        },
      });

      if (
        submission?.listing?.sponsorId &&
        userSponsors.includes(submission?.listing?.sponsorId)
      ) {
        return 'SPONSOR';
      }

      if (submission?.userId === userId) {
        return 'TALENT';
      }
      return 'PUBLIC';

    case 'listing':
      const listing = await prisma.bounties.findUnique({
        where: {
          id: refId,
        },
      });

      if (listing?.sponsorId && userSponsors.includes(listing?.sponsorId)) {
        return 'SPONSOR';
      }

      return 'PUBLIC';
    case 'sponsor':
      if (userSponsors.includes(refId)) {
        return 'SPONSOR';
      }

      return 'PUBLIC';
    case 'milestone':
      const milestone = await prisma.milestone.findUnique({
        where: {
          id: refId,
        },
      });

      if (
        milestone?.submissionId &&
        userSponsors.includes(milestone?.submissionId)
      ) {
        return 'SPONSOR';
      }

      return 'PUBLIC';
  }
}

async function getLogRef(
  refType: RefType,
  refId: string,
): Promise<Prisma.EventLogWhereInput> {
  switch (refType) {
    case 'milestone':
      return {
        milestoneId: refId,
      };
    case 'submission':
      const submission = await prisma.submission.findUnique({
        select: {
          listingId: true,
        },
        where: {
          id: refId,
        },
      });

      if (!submission) {
        return {
          submissionId: refId,
        };
      }

      return {
        OR: [
          {
            submissionId: refId,
          },
          {
            listingId: submission?.listingId ?? null,
            submissionId: null,
          },
        ],
      };
    case 'listing':
      return {
        listingId: refId,
      };
    case 'sponsor':
      return {
        sponsorId: refId,
      };
  }
}

function visibilityToPrisma(
  visibility: EventVisibility,
): Prisma.EventLogWhereInput {
  switch (visibility) {
    case 'PLATFORM_ADMIN':
      return {};
    case 'SPONSOR':
      return {
        visibility: {
          in: ['SPONSOR', 'TALENT', 'PUBLIC'],
        },
      };
    case 'TALENT':
      return {
        visibility: {
          in: ['TALENT', 'PUBLIC'],
        },
      };
    case 'PUBLIC':
      return {
        visibility: 'PUBLIC',
      };
  }
}

async function submission(
  req: NextApiRequestWithPotentialSponsor,
  res: NextApiResponse,
) {
  const refId = req.query.refId as string;
  const refType = req.query.refType as RefType;
  const eventTypesRaw = req.query.eventTypes as EventType[] | undefined;
  const eventTypes = eventTypesRaw
    ? Array.isArray(eventTypesRaw)
      ? eventTypesRaw
      : [eventTypesRaw]
    : undefined;
  const searchText = req.query.searchText as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const sort = (req.query.sort as 'asc' | 'desc' | undefined) || 'desc';
  const startDate = (req.query.startDate as string | undefined)
    ? new Date(req.query.startDate as string)
    : undefined;
  const endDate = (req.query.endDate as string | undefined)
    ? new Date(req.query.endDate as string)
    : undefined;

  startDate?.setHours(0, 0, 0, 0);
  endDate?.setHours(23, 59, 59, 999);

  if (!refId || !refType) {
    return res.status(400).json({
      message: 'Ref ID and ref type are required in the query parameters.',
    });
  }

  let visibility: EventVisibility | undefined = 'PUBLIC';
  if (!!req.authorized && !!req.userId) {
    visibility = await getAuthorizedVisibility(req.userId, refType, refId);
  }

  const maxVisibility = req.query.maxVisibility as EventVisibility | undefined;
  // Reduce visibility if visibility is higher than maxVisibility
  if (maxVisibility && isRoleAtLeast(visibility, maxVisibility)) {
    visibility = maxVisibility;
  }

  const searchTextWhere: Prisma.EventLogWhereInput = searchText
    ? {
        OR: [
          // Only allow user search if visibility is SPONSOR or higher
          ...(isRoleAtLeast(visibility, 'SPONSOR')
            ? [
                {
                  actor: {
                    name: {
                      contains: searchText,
                    },
                  },
                },
                {
                  actor: {
                    username: {
                      contains: searchText,
                    },
                  },
                },
              ]
            : []),
          {
            listing: {
              title: {
                contains: searchText,
              },
            },
          },
          ...(parseInt(searchText)
            ? [
                {
                  submission: {
                    sequentialId: {
                      equals: parseInt(searchText),
                    },
                  },
                },
              ]
            : []),
          {
            data: {
              path: '$.message',
              string_contains: searchText,
            },
          },
        ],
      }
    : {};

  const hideLogEventsForRemoved = isRoleAtLeast(visibility, 'SPONSOR')
    ? {}
    : {
        OR: [
          {
            comment: {
              isActive: true,
              isArchived: false,
            },
          },
          {
            comment: null,
          },
        ],
      };

  const dateFilter: Prisma.EventLogWhereInput = {};
  if (startDate || endDate) {
    dateFilter.eventTime = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    const whereClause: Prisma.EventLogWhereInput = {
      AND: [
        visibilityToPrisma(visibility),
        await getLogRef(refType, refId),
        eventTypes ? { eventType: { in: eventTypes } } : {},
        hideLogEventsForRemoved,
        searchTextWhere,
        dateFilter,
      ],
    };

    const totalCount = await prisma.eventLog.count({
      where: whereClause,
    });

    // Get paginated logs
    const logs = await prisma.eventLog.findMany({
      where: whereClause,
      include: prismaLogInclude,
      orderBy: {
        eventTime: sort,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const processedLogs = logs.map((log) => {
      return prepareLogData(log as unknown as Log, visibility);
    });

    return res.status(200).json({
      logs: processedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    logger.error(
      `Error fetching logs for refId=${refId} and refType=${refType}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
    });
  }
}

export default withPotentialSponsorAuth(submission);
