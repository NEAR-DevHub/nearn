import { ActorType, type EventVisibility, type Prisma } from '@prisma/client';
import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';

import { type NextApiRequestWithPotentialSponsor } from '@/features/auth/types';
import { withPotentialSponsorAuth } from '@/features/auth/utils/withPotentialSponsorAuth';
import { isRoleAtLeast } from '@/features/logging/types/event-data';

type RefType = 'submission' | 'listing' | 'sponsor';

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
    case 'submission':
      const submission = await prisma.submission.findUnique({
        where: {
          id: refId,
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
  }
}

async function getLogRef(
  refType: RefType,
  refId: string,
): Promise<Prisma.EventLogWhereInput> {
  switch (refType) {
    case 'submission':
      const submission = await prisma.submission.findUnique({
        where: {
          id: refId,
        },
      });

      return {
        OR: [
          {
            submissionId: refId,
          },
          {
            listingId: submission?.listingId,
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

  if (!refId || !refType) {
    return res.status(400).json({
      message: 'Ref ID and ref type are required in the query parameters.',
    });
  }

  let visibility: EventVisibility | undefined = 'PUBLIC';
  if (!!req.authorized && !!req.userId) {
    visibility = await getAuthorizedVisibility(req.userId, refType, refId);
  }
  try {
    const logs = await prisma.eventLog.findMany({
      where: {
        ...visibilityToPrisma(visibility),
        ...(await getLogRef(refType, refId)),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(
      logs.map((log) => ({
        ...log,
        // We don't want to expose who behind the scenes for sponsors
        actorId:
          log.actorType === ActorType.SPONSOR &&
          !isRoleAtLeast(visibility, 'SPONSOR')
            ? undefined
            : log.actorId,
      })),
    );
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
