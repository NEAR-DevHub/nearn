import dayjs from 'dayjs';

import { PROJECT_NAME } from '@/constants/project';

import { WinnerFeedImage } from '@/features/feed/components/WinnerFeedImage';
import {
  type EventDataMap,
  EventType,
} from '@/features/logging/types/event-data';

import { type Notification } from '../queries/useNotifications';
import { type NotificationDataMap, NotificationType } from '../types';

interface NotificationData {
  message: string;
  showActor?: boolean;
  subtitle?: React.ReactNode;
  link: string;
}

export function getNotificationAction(
  notification: Notification | null,
): NotificationData {
  if (!notification) return { message: 'New notification', link: '/' };

  const event = notification.event;
  const isNote = event?.visibility === 'SPONSOR';

  switch (notification.type) {
    case NotificationType.SUBMISSION_CREATED:
      return {
        message: 'send submission',
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}/${event?.submission?.sequentialId}`,
        subtitle: event?.submission?.sequentialId
          ? `#${event?.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.SUBMISSION_EDITED:
      return {
        message: `updated submission`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}/${event?.submission?.sequentialId}`,
        subtitle: event?.submission?.sequentialId
          ? `#${event?.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.LISTING_COMMENT:
      return {
        message: `commented`,
        link: `/comment/${event?.commentId}`,
        subtitle: event?.comment?.message,
      };

    case NotificationType.SUBMISSION_COMMENT:
      return {
        message: `commented your submission`,
        link: `/comment/${event?.commentId}`,
        subtitle: event?.comment?.message,
      };

    case NotificationType.POW_COMMENT:
      return {
        message: `commented your proof of work`,
        link: `/comment/${event?.commentId}`,
        subtitle: event?.comment?.message,
      };

    case NotificationType.NOTE_CREATED:
      return {
        message: `added note`,
        link: `/comment/${event?.commentId}`,
        subtitle: event?.comment?.message,
      };

    case NotificationType.COMMENT_REPLY:
      return {
        message: `replied to your ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event?.commentId}`,
        subtitle: event?.comment?.message,
      };

    case NotificationType.COMMENT_MENTIONED_YOU:
      return {
        message: `mentioned you in a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event?.commentId}`,
      };

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
      return {
        message: `announced winners`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}`,
      };

    case NotificationType.WINNER_NOTIFICATION:
      const dataWinner =
        notification.data as NotificationDataMap['WINNER_NOTIFICATION'];
      return {
        message: `Congrats! You were selected as a winner`,
        showActor: false,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}`,
        subtitle: (
          <WinnerFeedImage
            token={dataWinner.token}
            rewards={dataWinner.rewards}
            winnerPosition={dataWinner.winnerPosition}
          />
        ),
      };

    case NotificationType.LISTING_EDITED:
      const eventDataEdit =
        event?.data as EventDataMap[EventType.LISTING_EDITED];
      const deadline = eventDataEdit.changes.find(
        (change) => change.field === 'deadline',
      );
      if (deadline) {
        return {
          message: `updated listing - new deadline: ${dayjs(deadline.newValue as Date).format('MMM D, YYYY h:mm A')}`,
          link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}`,
        };
      }
      return {
        message: `updated listing`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}`,
      };

    case NotificationType.DEADLINE_IN_3_DAYS:
      return {
        showActor: false,
        message: `${PROJECT_NAME} Reminder: ${event?.listing?.title} deadline is in 3 days`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_APPROVED:
      const dataApproved =
        notification.data as NotificationDataMap['SUBMISSION_APPROVED'];
      return {
        showActor: false,
        message: `Congrats! Your submission was approved`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}/${event?.submission?.sequentialId}`,
        subtitle: (
          <div className="h-1/2 w-full">
            <WinnerFeedImage
              token={dataApproved.token}
              rewards={dataApproved.rewards}
              winnerPosition={dataApproved.winnerPosition}
              size="md"
              variant="default"
            />
          </div>
        ),
      };

    case NotificationType.SUBMISSION_PAID:
      return {
        message: `marked your submission as paid`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}/${event?.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_REJECTED:
      return {
        message: `has rejected your submission`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}/${event?.submission?.sequentialId}`,
      };

    case NotificationType.SPONSOR_MEMBER_INVITED:
      const eventDataInvite =
        event?.data as EventDataMap[EventType.SPONSOR_MEMBER_INVITED];
      return {
        message: `invited you to the team`,
        link: `/signup?invite=${eventDataInvite.token}`,
      };

    case NotificationType.SPONSOR_MEMBER_ACCEPTED:
      return {
        message: `joined to the team`,
        link: `/dashboard/team-settings`,
      };

    case NotificationType.COMMENT_PINNED:
      return {
        message: `pinned a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event?.commentId}`,
      };

    case NotificationType.SCOUT_INVITE:
      return {
        message: `invited you to participate`,
        link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}`,
      };

    case NotificationType.LIKE:
      const dataLike = notification.data as NotificationDataMap['LIKE'];

      let link = '';
      let name: string = dataLike.type;
      switch (dataLike.type) {
        case 'submission':
          link = '/submission/' + dataLike.refId;
          break;
        case 'poW':
          link = '/feed/pow/' + dataLike.refId;
          name = 'proof of work';
          break;
        case 'comment':
          link = '/comment/' + dataLike.refId;
      }
      return {
        message: `liked your ${name}`,
        link,
      };

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      switch (event?.eventType) {
        case EventType.TREASURY_PROPOSAL_EXPIRED:
          return {
            message: `updated treasury proposal - expired`,
            link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
          };
        case EventType.TREASURY_PROPOSAL_REJECTED:
          return {
            message: `updated treasury proposal - rejected`,
            link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
          };
        case EventType.TREASURY_PROPOSAL_APPROVED:
          return {
            message: `updated treasury proposal - approved`,
            link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
          };
        default:
          return {
            message: `updated treasury proposal`,
            link: `/${event?.sponsor?.slug}/${event?.listing?.sequentialId}/${event?.submission?.sequentialId}`,
          };
      }
  }
}
