import { CommentType } from '@prisma/client';
import dayjs from 'dayjs';

import { WinnerFeedImage } from '@/features/feed/components/WinnerFeedImage';

import { type Notification } from '../queries/useNotifications';
import { type NotificationDataMap, NotificationType } from '../types';

interface NotificationData {
  message: string;
  actor: 'platform' | 'sponsor' | 'user';
  subtitle?: React.ReactNode;
  link: string;
}

export function getNotificationAction(
  notification: Notification<NotificationType> | null,
): NotificationData {
  if (!notification)
    return { message: 'New notification', link: '/', actor: 'platform' };

  const isNote =
    notification.comment?.type === CommentType.INTERNAL_SUBMISSION_NOTES;

  switch (notification.type) {
    case NotificationType.SUBMISSION_CREATED:
      return {
        actor: 'user',
        message: 'send submission',
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_RECEIVED:
      return {
        actor: 'sponsor',
        message: 'received your submission',
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_EDITED:
      return {
        actor: 'user',
        message: `updated submission`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.LISTING_COMMENT:
      return {
        actor: 'user',
        message: `commented`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.SUBMISSION_COMMENT:
      return {
        actor: 'user',
        message: `commented your submission`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.POW_COMMENT:
      return {
        actor: 'user',
        message: `commented your proof of work`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.NOTE_CREATED:
      return {
        actor: 'user',
        message: `added note`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.COMMENT_REPLY:
      return {
        actor: 'user',
        message: `replied to your ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.COMMENT_MENTIONED_YOU:
      return {
        actor: 'user',
        message: `mentioned you in a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
      return {
        actor: 'sponsor',
        message: `announced winners`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.LISTING_EDITED:
      const eventDataEdit =
        notification.data as NotificationDataMap['LISTING_EDITED'];
      const deadline = eventDataEdit.changes.find(
        (change) => change.field === 'deadline',
      );
      if (deadline) {
        return {
          actor: 'sponsor',
          message: `updated listing - new deadline: ${dayjs(deadline.newValue).format('MMM D, YYYY h:mm A')}`,
          link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
        };
      }
      return {
        actor: 'sponsor',
        message: `updated listing`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.DEADLINE_IN_3_DAYS:
      return {
        actor: 'platform',
        message: `Reminder: ${notification?.listing?.title} deadline is in 3 days`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_APPROVED:
      const dataApproved =
        notification.data as NotificationDataMap['SUBMISSION_APPROVED'];
      return {
        actor: 'platform',
        message: `Congrats! Your submission was approved`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
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
        actor: 'sponsor',
        message: `marked your submission as paid`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_REJECTED:
      return {
        actor: 'sponsor',
        message: `has rejected your submission`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SPONSOR_MEMBER_INVITED:
      const eventDataInvite =
        notification.data as NotificationDataMap['SPONSOR_MEMBER_INVITED'];
      return {
        actor: 'sponsor',
        message: `invited you to join the team`,
        link: `/signup?invite=${eventDataInvite.token}`,
      };

    case NotificationType.SPONSOR_MEMBER_ACCEPTED:
      return {
        actor: 'user',
        message: `joined to the team`,
        link: `/dashboard/team-settings`,
      };

    case NotificationType.COMMENT_PINNED:
      return {
        actor: 'sponsor',
        message: `pinned a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${notification?.commentId}`,
      };

    case NotificationType.SCOUT_INVITE:
      return {
        actor: 'sponsor',
        message: `invited you to participate`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.DEADLINE_EXCEEDED_BY_WEEK:
      return {
        actor: 'platform',
        message: `Reminder! 7 days have passed since the deadline. Please announce your selection/s on NEARN soon!`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.DEADLINE_ENDED:
      return {
        actor: 'platform',
        message: `The listing submission time reached its deadline`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.LIKE:
      let link = '';
      let name: string = '';
      if (notification.submission) {
        link = `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`;
        name = 'submission';
      } else if (notification.pow) {
        link = `/feed/pow/${notification?.powId}`;
        name = 'proof of work';
      } else if (notification.comment) {
        link = `/comment/${notification?.commentId}`;
        name = 'comment';
      }
      return {
        actor: 'user',
        message: `liked your ${name}`,
        link,
      };

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      const dataTreasury =
        notification.data as NotificationDataMap['TREASURY_PROPOSAL_STATUS_CHANGED'];
      switch (dataTreasury.status) {
        case 'expired':
          return {
            actor: 'platform',
            message: `Treasury proposal - expired`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
        case 'rejected':
          return {
            actor: 'platform',
            message: `Treasury proposal - rejected`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
        case 'approved':
          return {
            actor: 'platform',
            message: `Treasury proposal - approved`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
        default:
          return {
            actor: 'platform',
            message: `Treasury proposal - updated`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
      }
    case NotificationType.WEEKLY_ROUNDUP:
    case NotificationType.NEW_LISTING_FOR_SKILLS:
    case NotificationType.PRODUCT_UPDATES_AND_NEWS:
      return {
        actor: 'platform',
        message: 'Placeholder',
        link: '/',
      };
  }
}
