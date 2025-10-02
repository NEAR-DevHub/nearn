import { NotificationRelationType, Regions } from '@prisma/client';
import dayjs from 'dayjs';

import { TeamRegions } from '@/constants/Team';
import {
  developmentSkills,
  nonDevelopmentSubSkills,
  type Skills,
} from '@/interface/skills';
import { prisma } from '@/prisma';

import { createNotification } from '@/features/notifications/services/notification-service';
import {
  NotificationChannel,
  NotificationType,
} from '@/features/notifications/types';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

export async function listingsForYou(): Promise<CronJobResult> {
  const logger = new CronLogger('listings-for-you');
  const last24Hours = dayjs().subtract(24, 'hours').toISOString();
  const lastWeek = dayjs().subtract(7, 'days').toISOString();
  const now = dayjs().toISOString();

  try {
    const listings = await prisma.bounties.findMany({
      where: {
        isPublished: true,
        isPrivate: false,
        isWinnersAnnounced: false,
        deadline: {
          gt: now,
        },
        type: {
          not: 'hackathon',
        },
        publishedAt: {
          gte: lastWeek,
          lt: last24Hours,
        },
        shouldSendEmail: true,
        OR: [
          {
            compensationType: 'variable',
          },
          {
            usdValue: {
              gte: 1000,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        region: true,
        skills: true,
        type: true,
        slug: true,
        sponsorId: true,
        rewardAmount: true,
        token: true,
        sponsor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'asc',
      },
    });

    if (listings.length === 0) {
      return {
        success: true,
        message: 'No listings found',
      };
    }

    let selectedListing = null;

    for (const listing of listings) {
      const emailLogExists = await prisma.notification.findFirst({
        where: {
          listingId: listing.id,
          type: NotificationType.NEW_LISTING_FOR_SKILLS,
        },
      });

      if (!emailLogExists) {
        selectedListing = listing;
        break;
      }
    }

    if (!selectedListing) {
      return {
        success: true,
        message: 'All listings have been sent',
      };
    }

    const team = TeamRegions.find(
      (team) => team.region === selectedListing.region,
    );
    const countries = team ? team.country : [];
    const listingSkills = selectedListing.skills as Skills;
    const listingMainSkills = listingSkills.map((skill) => skill.skills);
    const listingSubSkills = listingSkills.flatMap((skill) => skill.subskills);

    const listingDevelopmentSkills = listingMainSkills.filter((skill) =>
      developmentSkills.includes(skill),
    );
    const listingNonDevelopmentSubSkills = listingSubSkills.filter((subskill) =>
      nonDevelopmentSubSkills.includes(subskill),
    );

    const developmentSkillConditions = listingDevelopmentSkills.map(
      (skill) => ({
        skills: {
          path: '$[*].skills',
          array_contains: skill,
        },
      }),
    );

    const nonDevelopmentSubSkillConditions = listingNonDevelopmentSubSkills.map(
      (subskill) => ({
        skills: {
          path: '$[*].subskills',
          array_contains: subskill,
        },
      }),
    );

    const users = await prisma.user.findMany({
      where: {
        isTalentFilled: true,
        ...(selectedListing.region !== Regions.GLOBAL && {
          location: { in: countries },
        }),
        OR: [
          ...developmentSkillConditions,
          ...nonDevelopmentSubSkillConditions,
        ],
        NotificationSettings: {
          some: {
            type: NotificationType.NEW_LISTING_FOR_SKILLS,
            channel: NotificationChannel.EMAIL,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
      },
    });

    await Promise.all(
      users.map(async (user) => {
        let userSkills: Skills | null = null;

        if (typeof user.skills === 'string') {
          try {
            userSkills = JSON.parse(user.skills);
          } catch (error) {
            console.error(`Failed to parse skills for user ${user.id}:`, error);
            return null;
          }
        } else {
          userSkills = user.skills as Skills;
        }

        if (!userSkills) return null;

        return createNotification(
          NotificationType.NEW_LISTING_FOR_SKILLS,
          NotificationRelationType.TALENT,
          user.id,
          {
            listingId: selectedListing.id,
            sponsorId: selectedListing.sponsorId,
          },
        );
      }),
    );

    return {
      success: true,
      message: 'Job completed successfully',
    };
  } catch (error) {
    logger.error('Job failed', error);
    return {
      success: false,
      message: `Job failed: ${error}`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
