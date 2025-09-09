import { prisma } from '@/prisma';

import { type Log } from '@/features/logging/queries/logs';
import {
  type EventDataMap,
  EventType,
} from '@/features/logging/types/event-data';

import { type NotificationChannel, NotificationType } from '../types';

async function checkNotificationChannelsForEvent(
  _eventType: NotificationType,
  _receiverId?: string,
): Promise<NotificationChannel[]> {
  return ['inApp'];

  // const eventSettings = await prisma.notificationSettings.findMany({
  //   where: {
  //     userId: receiverId,
  //     type: eventType,
  //   }
  // });

  // return eventSettings.map(setting => setting.channel as NotificationChannel);
}

export async function createNotification(
  notificationType: NotificationType,
  actorId?: string | null,
  receiverId?: string,
  eventId?: string,
  sponsorId?: string | null,
) {
  if (actorId === receiverId || !actorId || !receiverId) {
    return;
  }

  const channels = await checkNotificationChannelsForEvent(
    notificationType,
    receiverId,
  );

  for (const channel of channels) {
    await prisma.notification.create({
      data: {
        eventId: eventId,
        userId: receiverId,
        type: notificationType,
        channel,
        sponsorId: sponsorId ?? undefined,
      },
    });
  }
}

const noNotification = null;

async function fetchSubmittersAndWatchers(
  listingId: string | null,
  filterOutWinner: boolean = false,
) {
  if (!listingId) {
    return [];
  }

  const filter = filterOutWinner ? { isWinner: false } : {};

  return await prisma.user.findMany({
    where: {
      OR: [
        { Submission: { some: { listingId: listingId, ...filter } } },
        { SubscribeBounty: { some: { bountyId: listingId } } },
      ],
    },
  });
}

const mapping: Record<EventType, ((event: Log) => Promise<void>) | null> = {
  [EventType.SUBMISSION_CREATED]: async (event) => {
    await createNotification(
      EventType.SUBMISSION_CREATED,
      event.actorId,
      event.listing?.pocId,
      event.id,
      event.sponsorId,
    );
  },
  [EventType.SUBMISSION_EDITED]: async (event) => {
    await createNotification(
      EventType.SUBMISSION_EDITED,
      event.actorId,
      event.listing?.pocId,
      event.id,
      event.sponsorId,
    );
  },
  [EventType.COMMENT_ADDED]: async (event) => {
    if (event.comment?.refType === 'BOUNTY') {
      await createNotification(
        NotificationType.LISTING_COMMENT,
        event.actorId,
        event.listing?.pocId,
        event.id,
        event.sponsorId,
      );
    } else if (
      event.comment?.refType === 'SUBMISSION' &&
      event.visibility === 'PUBLIC'
    ) {
      await createNotification(
        NotificationType.SUBMISSION_COMMENT,
        event.actorId,
        event.submission?.userId,
        event.id,
      );
    } else if (
      event.comment?.refType === 'SUBMISSION' &&
      event.visibility === 'SPONSOR'
    ) {
      await createNotification(
        NotificationType.NOTE_CREATED,
        event.actorId,
        event.listing?.pocId,
        event.id,
        event.sponsorId,
      );
    } else if (event.comment?.refType === 'POW') {
      await createNotification(
        NotificationType.POW_COMMENT,
        event.actorId,
        event.pow?.userId,
        event.id,
      );
    }

    if (event.comment?.repliedTo) {
      await createNotification(
        NotificationType.COMMENT_REPLY,
        event.actorId,
        event.comment.repliedTo.authorId,
        event.id,
      );
    }

    const taggedUsernames = (event.comment?.message as string)
      .split(' ')
      .filter((tag) => tag.startsWith('@'))
      .map((tag) => tag.substring(1));
    const taggedUsers = await prisma.user.findMany({
      select: {
        id: true,
      },
      where: {
        AND: [
          {
            username: {
              in: taggedUsernames,
            },
          },
          {
            NOT: {
              id: event.actorId as string,
            },
          },
        ],
      },
    });

    await Promise.all(
      taggedUsers.map((user) =>
        createNotification(
          NotificationType.COMMENT_MENTIONED_YOU,
          event.actorId,
          user.id,
        ),
      ),
    );
  },
  [EventType.LISTING_WINNERS_ANNOUNCED]: async (event) => {
    const submittersAndWatchers = await fetchSubmittersAndWatchers(
      event.listingId,
      true,
    );

    await Promise.all(
      submittersAndWatchers.map((user) =>
        createNotification(
          EventType.LISTING_WINNERS_ANNOUNCED,
          event.actorId,
          user.id,
          event.id,
        ),
      ),
    );

    const winners = await prisma.submission.findMany({
      where: {
        listingId: event.listing?.id,
        isWinner: true,
      },
      select: {
        userId: true,
      },
    });

    await Promise.all(
      winners.map((winner) =>
        createNotification(
          NotificationType.WINNER_NOTIFICATION,
          event.actorId,
          winner.userId,
          event.id,
        ),
      ),
    );
  },
  [EventType.LISTING_EDITED]: async (event) => {
    const submittersAndWatchers = await fetchSubmittersAndWatchers(
      event.listingId,
    );
    await Promise.all(
      submittersAndWatchers.map((user) =>
        createNotification(EventType.LISTING_EDITED, event.actorId, user.id),
      ),
    );
  },
  [EventType.SUBMISSION_APPROVED]: async (event) => {
    await createNotification(
      EventType.SUBMISSION_APPROVED,
      event.actorId,
      event.submission?.userId,
      event.id,
    );
  },
  [EventType.SUBMISSION_PAID]: async (event) => {
    await createNotification(
      EventType.SUBMISSION_PAID,
      event.actorId,
      event.submission?.userId,
      event.id,
    );
  },
  [EventType.TREASURY_PROPOSAL_REJECTED]: async (event) => {
    await createNotification(
      NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED,
      event.actorId,
      event.listing?.pocId,
      event.id,
      event.sponsorId,
    );
  },
  [EventType.TREASURY_PROPOSAL_EXPIRED]: async (event) => {
    await createNotification(
      NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED,
      event.actorId,
      event.listing?.pocId,
      event.id,
      event.sponsorId,
    );
  },
  [EventType.TREASURY_PROPOSAL_APPROVED]: async (event) => {
    await Promise.all([
      createNotification(
        NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED,
        event.actorId,
        event.listing?.pocId,
        event.id,
        event.sponsorId,
      ),
      createNotification(
        EventType.SUBMISSION_PAID,
        event.actorId,
        event.submission?.userId,
        event.id,
      ),
    ]);
  },
  [EventType.SUBMISSION_REJECTED]: async (event) => {
    await createNotification(
      EventType.SUBMISSION_REJECTED,
      event.actorId,
      event.submission?.userId,
      event.id,
    );
  },
  [EventType.SPONSOR_MEMBER_INVITED]: async (event) => {
    if (!event.sponsorId) {
      return;
    }

    const eventDataInvite =
      event.data as EventDataMap[EventType.SPONSOR_MEMBER_INVITED];

    const member = await prisma.user.findFirst({
      where: {
        email: eventDataInvite.invitedEmail,
      },
    });

    if (!member) {
      return;
    }

    await createNotification(
      EventType.SPONSOR_MEMBER_INVITED,
      event.actorId,
      member.id,
      event.id,
    );
  },
  [EventType.SPONSOR_MEMBER_ACCEPTED]: async (event) => {
    if (!event.sponsorId) {
      return;
    }

    const members = await prisma.userSponsors.findMany({
      where: {
        sponsorId: event.sponsorId,
      },
      select: {
        userId: true,
      },
    });

    await Promise.all(
      members.map((member) =>
        createNotification(
          EventType.SPONSOR_MEMBER_ACCEPTED,
          event.actorId,
          member.userId,
          event.id,
          event.sponsorId,
        ),
      ),
    );
  },
  [EventType.COMMENT_PINNED]: async (event) => {
    if (event.visibility === 'PUBLIC') {
      const submittersAndWatchers = await fetchSubmittersAndWatchers(
        event.listingId,
      );
      await Promise.all(
        submittersAndWatchers.map((user) =>
          createNotification(EventType.COMMENT_PINNED, event.actorId, user.id),
        ),
      );
    } else if (event.visibility === 'SPONSOR') {
      if (!event.sponsorId) {
        return;
      }

      const members = await prisma.userSponsors.findMany({
        where: {
          sponsorId: event.sponsorId,
        },
        select: {
          userId: true,
        },
      });

      await Promise.all(
        members.map((member) =>
          createNotification(
            EventType.COMMENT_PINNED,
            event.actorId,
            member.userId,
            event.id,
            event.sponsorId,
          ),
        ),
      );
    }
  },
  [EventType.SCOUT_INVITE]: async (event) => {
    if (!event.sponsorId) {
      return;
    }
    const data = event.data as EventDataMap[EventType.SCOUT_INVITE];

    await createNotification(
      EventType.SCOUT_INVITE,
      event.actorId,
      data.scoutUserId,
      event.id,
    );
  },
  // We don't need to send notifications for these events
  [EventType.SPONSOR_TREASURY_ADDED]: noNotification,
  [EventType.SPONSOR_TREASURY_REMOVED]: noNotification,
  [EventType.SPONSOR_MEMBER_REMOVED]: noNotification,
  [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: noNotification,
  [EventType.SPONSOR_PROFILE_EDITED]: noNotification,
  [EventType.LISTING_CREATED]: noNotification,
  [EventType.LISTING_PUBLISHED]: noNotification,
  [EventType.LISTING_COMPLETED]: noNotification,
  [EventType.LISTING_UNPUBLISHED]: noNotification,
  [EventType.SUBMISSION_NOTE_CHANGED]: noNotification,
  [EventType.SUBMISSION_LABEL_CHANGED]: noNotification,
  [EventType.SUBMISSION_TOGGLED_WINNER]: noNotification,
  [EventType.SUBMISSION_TREASURY_CREATED]: noNotification,
  [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: noNotification,
  [EventType.SUBMISSION_MANUAL_PAYMENT_ADDED]: noNotification,
  [EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED]: noNotification,
  [EventType.COMMENT_DELETED]: noNotification,
  [EventType.COMMENT_UNPINNED]: noNotification,
  [EventType.PLATFORM_ADMIN_ARCHIVED_OR_UNARCHIVED]: noNotification,
  [EventType.PLATFORM_ADMIN_SUBMISSION_STATUS_EDITED]: noNotification,
  [EventType.SYSTEM_STATUS_CHANGED]: noNotification,
  [EventType.SYSTEM_STATUS_IN_REVIEW]: noNotification,
  [EventType.AUTOMATION_LOG]: noNotification,
};

export const createNotificationFromEvent = async (event: Log) => {
  const mappingFunction = mapping[event.eventType as EventType];
  if (!mappingFunction) {
    return;
  }
  await mappingFunction(event);
};
