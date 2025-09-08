import { PROJECT_NAME } from '@/constants/project';

import { type Notification } from '../queries/useNotifications';
import { NotificationType } from '../types';

interface NotificationData {
  message: string;
  subtitle?: string;
}

export function getNotificationData(
  notification: Notification | null,
): NotificationData {
  if (!notification || !notification.event)
    return { message: 'New notification' };

  const event = notification.event;

  const actorName = event.actor?.username || 'Someone';
  const listingTitle = event.listing?.title || 'a listing';
  const teamName = event.sponsor?.name || 'the team';

  switch (notification.type) {
    case NotificationType.SUBMISSION_CREATED:
      return {
        message: `${actorName} send submission in ${listingTitle}`,
        subtitle: event.submission?.sequentialId
          ? `Submission ID: ${event.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.SUBMISSION_EDITED:
      return {
        message: `${actorName} updated submission in ${listingTitle}`,
        subtitle: event.submission?.sequentialId
          ? `Submission ID: ${event.submission.sequentialId}`
          : undefined,
      };

    case NotificationType.LISTING_COMMENT:
      return {
        message: `${actorName} commented in ${listingTitle}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.SUBMISSION_COMMENT:
      return {
        message: `${actorName} commented your submission in ${listingTitle}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.POW_COMMENT:
      return {
        message: `${actorName} commented your proof of work`,
        subtitle: event.comment?.message,
      };

    case NotificationType.NOTE_CREATED:
      return {
        message: `${actorName} added note in ${listingTitle} in Submission ${event.submission?.sequentialId || 'ID'}`,
        subtitle: event.comment?.message,
      };

    case NotificationType.COMMENT_REPLY:
      if (event.comment?.refType === 'BOUNTY') {
        return {
          message: `${actorName} replied to your comment in ${listingTitle}`,
          subtitle: event.comment?.message,
        };
      } else if (
        event.comment?.refType === 'SUBMISSION' &&
        event.visibility === 'PUBLIC'
      ) {
        return {
          message: `${actorName} replied to your comment in ${listingTitle} in your submission`,
          subtitle: event.comment?.message,
        };
      } else if (
        event.comment?.refType === 'SUBMISSION' &&
        event.visibility === 'SPONSOR'
      ) {
        return {
          message: `${actorName} replied to your note in ${listingTitle} in Submission ${event.submission?.sequentialId || 'ID'}`,
          subtitle: event.comment?.message,
        };
      } else if (event.comment?.refType === 'POW') {
        return {
          message: `${actorName} replied to your comment on your proof of work`,
          subtitle: event.comment?.message,
        };
      }
      return {
        message: `${actorName} replied to your comment`,
        subtitle: event.comment?.message,
      };

    case NotificationType.COMMENT_LIKE:
      if (event.comment?.refType === 'BOUNTY') {
        return {
          message: `${actorName} liked your comment in ${listingTitle}`,
        };
      } else if (
        event.comment?.refType === 'SUBMISSION' &&
        event.visibility === 'PUBLIC'
      ) {
        return {
          message: `${actorName} liked your comment in ${listingTitle} in your submission`,
        };
      } else if (
        event.comment?.refType === 'SUBMISSION' &&
        event.visibility === 'SPONSOR'
      ) {
        return {
          message: `${actorName} liked your note in ${listingTitle} in Submission ${event.submission?.sequentialId || 'ID'}`,
        };
      } else if (event.comment?.refType === 'POW') {
        return {
          message: `${actorName} liked your proof of work`,
        };
      }
      return {
        message: `${actorName} liked your comment`,
      };

    case NotificationType.COMMENT_MENTIONED_YOU:
      if (event.comment?.refType === 'BOUNTY') {
        return {
          message: `${actorName} mentioned you in a comment in ${listingTitle}`,
          subtitle: event.comment?.message,
        };
      } else if (
        event.comment?.refType === 'SUBMISSION' &&
        event.visibility === 'PUBLIC'
      ) {
        return {
          message: `${actorName} mentioned you in a comment in ${listingTitle} in your submission`,
          subtitle: event.comment?.message,
        };
      } else if (
        event.comment?.refType === 'SUBMISSION' &&
        event.visibility === 'SPONSOR'
      ) {
        return {
          message: `${actorName} mentioned you in a note in ${listingTitle} in Submission ${event.submission?.sequentialId || 'ID'}`,
          subtitle: event.comment?.message,
        };
      }
      return {
        message: `${actorName} mentioned you in a comment`,
        subtitle: event.comment?.message,
      };

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
      return {
        message: `${actorName} Announced winners in ${listingTitle}`,
      };

    case NotificationType.WINNER_NOTIFICATION:
      return {
        message: `Congrats! You were selected as a winner for ${listingTitle}`,
      };

    case NotificationType.LISTING_EDITED:
      return {
        message: `${actorName} updated ${listingTitle}`,
      };

    case NotificationType.DEADLINE_IN_3_DAYS:
      return {
        message: `${PROJECT_NAME} Reminder: ${listingTitle} deadline is in 3 days`,
      };

    case NotificationType.SUBMISSION_APPROVED:
      return {
        message: `Congrats! Your submission is approved for ${listingTitle}`,
      };

    case NotificationType.SUBMISSION_PAID:
      return {
        message: `${actorName} marked as paid your submission ${listingTitle}`,
      };

    case NotificationType.SUBMISSION_REJECTED:
      return {
        message: `${actorName} has rejected your submission to ${listingTitle}`,
      };

    case NotificationType.SPONSOR_MEMBER_INVITED:
      return {
        message: `${actorName} invited you to the ${teamName} team`,
      };

    case NotificationType.SPONSOR_MEMBER_ACCEPTED:
      return {
        message: `${actorName} joined to the ${teamName} team`,
      };

    case NotificationType.COMMENT_PINNED:
      return {
        message: `${actorName} pinned a comment in ${listingTitle}`,
      };

    case NotificationType.SCOUT_INVITE:
      return {
        message: `${actorName} invited you to scout for ${teamName}`,
      };

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      return {
        message: `Treasury proposal status changed for ${listingTitle}`,
      };

    default:
      return { message: 'New notification' };
  }
}

export function getNotificationMessage(notification: Notification): string {
  const { message } = getNotificationData(notification);
  return message;
}

export function getNotificationIcon(
  notificationType: NotificationType,
): string {
  switch (notificationType) {
    case NotificationType.SUBMISSION_CREATED:
    case NotificationType.SUBMISSION_EDITED:
      return '📝';

    case NotificationType.LISTING_COMMENT:
    case NotificationType.SUBMISSION_COMMENT:
    case NotificationType.POW_COMMENT:
    case NotificationType.NOTE_CREATED:
    case NotificationType.COMMENT_REPLY:
    case NotificationType.COMMENT_MENTIONED_YOU:
      return '💬';

    case NotificationType.COMMENT_LIKE:
      return '👍';

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
    case NotificationType.WINNER_NOTIFICATION:
      return '🏆';

    case NotificationType.LISTING_EDITED:
      return '✏️';

    case NotificationType.DEADLINE_IN_3_DAYS:
      return '⏰';

    case NotificationType.SUBMISSION_APPROVED:
      return '✅';

    case NotificationType.SUBMISSION_PAID:
      return '💰';

    case NotificationType.SUBMISSION_REJECTED:
      return '❌';

    case NotificationType.SPONSOR_MEMBER_INVITED:
    case NotificationType.SPONSOR_MEMBER_ACCEPTED:
    case NotificationType.SCOUT_INVITE:
      return '👥';

    case NotificationType.COMMENT_PINNED:
      return '📌';

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      return '🏦';

    default:
      return '🔔';
  }
}
