import { CommentType } from '@prisma/client';
import dayjs from 'dayjs';

import { PROJECT_NAME } from '@/constants/project';

import { WinnerFeedImage } from '@/features/feed/components/WinnerFeedImage';

import { type Notification } from '../queries/useNotifications';
import { type NotificationDataMap, NotificationType } from '../types';

interface NotificationData {
  message: string;
  showActor?: boolean;
  subtitle?: React.ReactNode;
  link: string;
}

export function getNotificationAction(
  notification: Notification<NotificationType> | null,
): NotificationData {
  if (!notification) return { message: 'New notification', link: '/' };

  const isNote =
    notification.comment?.type === CommentType.INTERNAL_SUBMISSION_NOTES;

  switch (notification.type) {
    case NotificationType.SUBMISSION_CREATED:
      return {
        message: 'send submission',
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
        subtitle: notification?.submission
          ? `#${notification?.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.SUBMISSION_RECEIVED:
      return {
        message: 'Sponsor received your submission',
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_EDITED:
      return {
        message: `updated submission`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
        subtitle: notification?.submission
          ? `#${notification?.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.LISTING_COMMENT:
      return {
        message: `commented`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.SUBMISSION_COMMENT:
      return {
        message: `commented your submission`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.POW_COMMENT:
      return {
        message: `commented your proof of work`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.NOTE_CREATED:
      return {
        message: `added note`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.COMMENT_REPLY:
      return {
        message: `replied to your ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.COMMENT_MENTIONED_YOU:
      return {
        message: `mentioned you in a ${isNote ? 'note' : 'comment'}`,
        link: `/comment/${notification?.commentId}`,
        subtitle: notification?.comment?.message,
      };

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
      return {
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
          message: `updated listing - new deadline: ${dayjs(deadline.newValue).format('MMM D, YYYY h:mm A')}`,
          link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
        };
      }
      return {
        message: `updated listing`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.DEADLINE_IN_3_DAYS:
      return {
        showActor: false,
        message: `${PROJECT_NAME} Reminder: ${notification?.listing?.title} deadline is in 3 days`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_APPROVED:
      const dataApproved =
        notification.data as NotificationDataMap['SUBMISSION_APPROVED'];
      return {
        showActor: false,
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
        message: `marked your submission as paid`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SUBMISSION_REJECTED:
      return {
        message: `has rejected your submission`,
        link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
      };

    case NotificationType.SPONSOR_MEMBER_INVITED:
      const eventDataInvite =
        notification.data as NotificationDataMap['SPONSOR_MEMBER_INVITED'];
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
        link: `/comment/${notification?.commentId}`,
      };

    case NotificationType.SCOUT_INVITE:
      return {
        message: `invited you to participate`,
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
        message: `liked your ${name}`,
        link,
      };

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      const dataTreasury =
        notification.data as NotificationDataMap['TREASURY_PROPOSAL_STATUS_CHANGED'];
      switch (dataTreasury.status) {
        case 'expired':
          return {
            message: `updated treasury proposal - expired`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
        case 'rejected':
          return {
            message: `updated treasury proposal - rejected`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
        case 'approved':
          return {
            message: `updated treasury proposal - approved`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
        default:
          return {
            message: `updated treasury proposal`,
            link: `/${notification?.sponsor?.slug}/${notification?.listing?.sequentialId}/${notification?.submission?.sequentialId}`,
          };
      }
    case NotificationType.WEEKLY_ROUNDUP:
    case NotificationType.NEW_LISTING_FOR_SKILLS:
    case NotificationType.PRODUCT_UPDATES_AND_NEWS:
      return {
        message: 'placeholder',
        link: '/',
      };
  }
}
