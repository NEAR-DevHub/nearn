import dayjs from 'dayjs';

import { PROJECT_NAME } from '@/constants/project';

import {
  type EventDataMap,
  EventType,
} from '@/features/logging/types/event-data';

import { type Notification } from '../queries/useNotifications';
import { NotificationType } from '../types';

interface NotificationData {
  message: string;
  subtitle?: string;
  link: string;
}

export function getNotificationAction(
  notification: Notification | null,
): NotificationData {
  if (!notification || !notification.event)
    return { message: 'New notification', link: '/' };

  const event = notification.event;
  const isNote = event.visibility === 'SPONSOR';

  switch (notification.type) {
    case NotificationType.SUBMISSION_CREATED:
      return {
        message: 'send submission',
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
        subtitle: event.submission?.sequentialId
          ? `#${event.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.SUBMISSION_EDITED:
      return {
        message: `updated submission`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
        subtitle: event.submission?.sequentialId
          ? `#${event.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.LISTING_COMMENT:
      return {
        message: `commented`,
        link: `/comment/${event.commentId}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.SUBMISSION_COMMENT:
      return {
        message: `commented your submission`,
        link: `/comment/${event.commentId}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.POW_COMMENT:
      return {
        message: `commented your proof of work`,
        link: `/comment/${event.commentId}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.NOTE_CREATED:
      return {
        message: `added note`,
        link: `/comment/${event.commentId}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.COMMENT_REPLY:
      return {
        message: `replied to your ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event.commentId}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.COMMENT_LIKE:
      return {
        message: `liked your ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event.commentId}`,
      };

    case NotificationType.COMMENT_MENTIONED_YOU:
      return {
        message: `mentioned you in a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event.commentId}`,
      };

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
      return {
        message: `announced winners`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}`,
      };

    case NotificationType.WINNER_NOTIFICATION:
      return {
        message: `selected you as a winner. Congrats!`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}`,
      };

    case NotificationType.LISTING_EDITED:
      const eventDataEdit =
        event.data as EventDataMap[EventType.LISTING_EDITED];
      const deadline = eventDataEdit.changes.find(
        (change) => change.field === 'deadline',
      );
      if (deadline) {
        return {
          message: `updated listing - new deadline: ${dayjs(deadline.newValue as Date).format('MMM D, YYYY h:mm A')}`,
          link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}`,
        };
      }
      return {
        message: `updated listing`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}`,
      };

    case NotificationType.DEADLINE_IN_3_DAYS:
      return {
        message: `${PROJECT_NAME} Reminder: ${event.listing?.title} deadline is in 3 days`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_APPROVED:
      return {
        message: `approved your submission`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_PAID:
      return {
        message: `marked your submission as paid`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_REJECTED:
      return {
        message: `rejected your submission`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
      };

    case NotificationType.SPONSOR_MEMBER_INVITED:
      const eventDataInvite =
        event.data as EventDataMap[EventType.SPONSOR_MEMBER_INVITED];
      return {
        message: `invited you to the team`,
        link: `/signup?invite=${eventDataInvite.token}`,
      };

    case NotificationType.SPONSOR_MEMBER_ACCEPTED:
      return {
        message: `joined to the team`,
        link: `/dashboard/team-s`,
      };

    case NotificationType.COMMENT_PINNED:
      return {
        message: `pinned a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${event.commentId}`,
      };

    case NotificationType.SCOUT_INVITE:
      return {
        message: `invited you to participate`,
        link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}`,
      };

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      switch (event.eventType) {
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
            link: `/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`,
          };
      }
  }
}
