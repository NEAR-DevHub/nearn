import { NotificationRelationType } from '@prisma/client';
import dayjs from 'dayjs';

import { type WeeklyRoundupSkill } from '@/email-templates/Listing/weeklyRoundupTemplate';
import {
  developmentSkills,
  nonDevelopmentSubSkills,
  type ParentSkills,
  type Skills,
  type SubSkillsType,
} from '@/interface/skills';
import { prisma } from '@/prisma';

import { userRegionEligibilty } from '@/features/listings/utils/region';
import { createNotification } from '@/features/notifications/services/notification-service';
import { NotificationType } from '@/features/notifications/types';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

const ALLOWED_USERS = 20250;

export async function weeklyListingRoundup(): Promise<CronJobResult> {
  const logger = new CronLogger('weekly-listing-roundup');

  try {
    const users = await prisma.user.findMany({
      where: {
        NotificationSettings: {
          some: {
            channel: 'email',
            type: NotificationType.WEEKLY_ROUNDUP,
          },
        },
        isTalentFilled: true,
      },
      select: {
        id: true,
        skills: true,
        email: true,
        name: true,
        location: true,
      },
      orderBy: {
        Submission: {
          _count: 'desc',
        },
      },
      take: ALLOWED_USERS,
    });

    const listings = await prisma.bounties.findMany({
      where: {
        isPublished: true,
        isActive: true,
        isArchived: false,
        status: 'OPEN',
        isWinnersAnnounced: false,
        deadline: { gte: dayjs().add(1, 'day').toISOString() },
        isPrivate: false,
      },
      include: { sponsor: true },
    });

    const processedListings = listings.map((listing) => {
      const listingSkills = listing.skills as Skills;

      const mainSkillsSet = new Set<ParentSkills>(
        listingSkills.map((skill) => skill.skills),
      );
      const subSkillsSet = new Set<SubSkillsType>(
        listingSkills.flatMap((skill) => skill.subskills),
      );

      const developmentSkillsSet = new Set<string>(
        [...mainSkillsSet].filter((skill) => developmentSkills.includes(skill)),
      );
      const nonDevelopmentSubSkillsSet = new Set<string>(
        [...subSkillsSet].filter((subskill) =>
          nonDevelopmentSubSkills.includes(subskill),
        ),
      );

      return {
        ...listing,
        developmentSkillsSet,
        nonDevelopmentSubSkillsSet,
      };
    });

    for (const user of users) {
      if (!user) continue;

      let userSkills: WeeklyRoundupSkill[] | null = null;

      if (typeof user.skills === 'string') {
        try {
          userSkills = JSON.parse(user.skills);
        } catch (error) {
          console.error('Failed to parse user skills:', error);
          continue;
        }
      } else {
        userSkills = user.skills as any as WeeklyRoundupSkill[];
      }

      if (!userSkills) continue;

      const userMainSkillsSet = new Set<ParentSkills>();
      const userSubSkillsSet = new Set<SubSkillsType>();

      userSkills.forEach((userSkill: WeeklyRoundupSkill) => {
        if (Array.isArray(userSkill.skills)) {
          userSkill.skills.forEach((skill: ParentSkills) =>
            userMainSkillsSet.add(skill),
          );
        } else {
          userMainSkillsSet.add(userSkill.skills as ParentSkills);
        }
        if (Array.isArray(userSkill.subskills)) {
          userSkill.subskills.forEach((subskill) =>
            userSubSkillsSet.add(subskill as SubSkillsType),
          );
        }
      });

      const matchingListings = processedListings.filter((listing) => {
        const hasDevelopmentSkillMatch = [...listing.developmentSkillsSet].some(
          (skill) => userMainSkillsSet.has(skill as ParentSkills),
        );

        const hasNonDevelopmentSubSkillMatch = [
          ...listing.nonDevelopmentSubSkillsSet,
        ].some((subskill) => userSubSkillsSet.has(subskill as SubSkillsType));

        if (!(hasDevelopmentSkillMatch || hasNonDevelopmentSubSkillMatch)) {
          return false;
        }

        return userRegionEligibilty({
          region: listing.region,
          userLocation: user.location || undefined,
        });
      });

      if (matchingListings.length === 0) continue;

      await createNotification(
        NotificationType.WEEKLY_ROUNDUP,
        NotificationRelationType.TALENT,
        user.id,
        {},
        {
          listings: matchingListings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            sponsor: listing.sponsor.name,
            slug: listing.slug,
            type: listing.type,
            token: listing.token,
            rewardAmount: listing.rewardAmount,
            compensationType: listing.compensationType,
            maxRewardAsk: listing.maxRewardAsk,
            minRewardAsk: listing.minRewardAsk,
            usdValue: listing.usdValue,
            skills: listing.skills,
          })),
          userSkills,
        },
      );
    }

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
