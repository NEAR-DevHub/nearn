import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { dayjs } from '@/utils/dayjs';
import { cleanRewards } from '@/utils/rank';
import { safeStringify } from '@/utils/safeStringify';

import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { getSponsorSession } from '@/features/auth/utils/getSponsorSession';
import { BONUS_REWARD_POSITION } from '@/features/listing-builder/constants';
import { type Rewards } from '@/features/listings/types';
import { isDeadlineOver } from '@/features/listings/utils/deadline';
import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

export async function POST(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await getSponsorSession(await headers());

    logger.debug(`Request params: ${safeStringify(params)}`);

    if (session.error || !session.data) {
      return NextResponse.json(
        { error: session.error },
        { status: session.status },
      );
    }

    const { userId, userSponsorId } = session.data;
    const id = params.id;

    const { error, listing } = await checkListingSponsorAuth(userSponsorId, id);
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (listing?.isWinnersAnnounced) {
      logger.warn(`Winners already announced for bounty with ID: ${id}`);

      return NextResponse.json(
        { error: `Winners already announced for bounty with id=${id}.` },
        { status: 400 },
      );
    }

    if (!listing?.isActive) {
      logger.warn(`Bounty with ID: ${id} is not active`);
      return NextResponse.json(
        { error: `Bounty with id=${id} is not active.` },
        { status: 400 },
      );
    }
    if (!listing?.isPublished) {
      logger.warn(`Bounty with ID: ${id} is not published`);
      return NextResponse.json(
        { error: `Bounty with id=${id} is not published.` },
        { status: 400 },
      );
    }

    const isSponsorship = listing?.type === 'sponsorship';

    const totalRewards = [
      ...cleanRewards(listing?.rewards as Rewards, true),
      ...Array(listing?.maxBonusSpots ?? 0).map(() => BONUS_REWARD_POSITION),
    ].length;

    if (
      !!totalRewards &&
      !isSponsorship &&
      listing?.BountyCounts.totalWinnersSelected !== totalRewards
    ) {
      logger.warn(
        'All winners have not been selected before publishing the results',
      );
      return NextResponse.json(
        { error: 'Please select all winners before publishing the results.' },
        { status: 400 },
      );
    }

    const deadline = dayjs().isAfter(listing?.deadline)
      ? listing?.deadline
      : dayjs().subtract(2, 'minute').toISOString();

    if (!isSponsorship) {
      logger.debug('Updating bounty details with winner announcement');
      await prisma.bounties.update({
        where: { id },
        data: {
          isWinnersAnnounced: true,
          deadline,
          winnersAnnouncedAt: new Date().toISOString(),
        },
        include: {
          sponsor: true,
        },
      });
    }

    const rewards: Rewards = (listing?.rewards || {}) as Rewards;
    const winners = await prisma.submission.findMany({
      where: {
        listingId: id,
        isWinner: true,
        isActive: true,
        isArchived: false,
      },
      include: {
        user: true,
      },
    });

    const promises = [];
    let currentIndex = 0;

    while (currentIndex < winners?.length) {
      const winnerPosition = Number(winners[currentIndex]?.winnerPosition);
      let amount: number = 0;
      if (winnerPosition && !isNaN(winnerPosition)) {
        amount = Math.ceil(rewards[winnerPosition as keyof Rewards] ?? 0);
      }

      const rewardInUSD =
        listing.token === 'Any'
          ? amount
          : (listing.usdValue! / listing.rewardAmount!) * amount;

      promises.push(
        prisma.submission.update({
          where: {
            id: winners[currentIndex]?.id,
          },
          data: {
            rewardInUSD,
            status: 'Approved',
            label:
              winners[currentIndex]?.label === 'New'
                ? 'Reviewed'
                : winners[currentIndex]?.label,
          },
        }),
      );

      if (listing.type === 'sponsorship') {
        const existingEventLog = await prisma.eventLog.findFirst({
          where: {
            eventType: EventType.SUBMISSION_APPROVED,
            listingId: id,
            submissionId: winners[currentIndex]?.id,
          },
        });

        if (existingEventLog) {
          currentIndex += 1;
          continue;
        }
      }

      //(todo: remove:) Temporary until UI implemented for multi-milestone we will auto-create a milestone for each winner
      // This should be handled in separate API. User should be able to choose to create a milestones or keep it as a single milestone
      promises.push(
        prisma.milestone.create({
          data: {
            milestoneIndex: 1,
            reward: rewards[winnerPosition as keyof Rewards] ?? 0,
            token:
              listing.token === 'Any'
                ? winners[currentIndex]?.token!
                : listing.token!,
            title: 'Full Milestone',
            status: 'Approved',
            submissionId: winners[currentIndex]?.id!,
          },
        }),
      );

      promises.push(
        eventLogger.log({
          eventType: EventType.SUBMISSION_APPROVED,
          actor: {
            id: userId as string,
            type: 'SPONSOR',
          },
          data: {
            position: winnerPosition,
          },
          entities: {
            listingId: id,
            submissionId: winners[currentIndex]?.id,
            sponsorId: userSponsorId,
          },
        }),
      );
      currentIndex += 1;
    }

    await Promise.all(promises);
    if (listing.type !== 'sponsorship') {
      await eventLogger.log({
        eventType: EventType.LISTING_WINNERS_ANNOUNCED,
        actor: {
          id: userId as string,
          type: 'SPONSOR',
        },
        data: {
          winners: winners.map((winner) => ({
            submissionId: winner.id,
            position: winner.winnerPosition ?? 0,
          })),
        },
        entities: {
          listingId: id,
          sponsorId: userSponsorId,
        },
      });
      await eventLogger.log({
        eventType: EventType.SYSTEM_STATUS_CHANGED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          oldStatus: !isDeadlineOver(listing.deadline ?? undefined)
            ? 'In Progress'
            : 'In Review',
          newStatus: 'Payment Pending',
        },
        entities: {
          listingId: id,
          sponsorId: userSponsorId,
        },
      });
    }

    logger.info(`Winners announced successfully for bounty ID: ${id}`);
    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error: any) {
    console.log(
      `Error announcing winners for bounty ID: ${params.id}: ${safeStringify(error)}`,
    );
    logger.error(
      `Error announcing winners for bounty ID: ${params.id}: ${safeStringify(error)}`,
    );
    return NextResponse.json(
      {
        error: error.message,
        message: `Error occurred while announcing bounty with id=${params.id}.`,
      },
      { status: 400 },
    );
  }
}
