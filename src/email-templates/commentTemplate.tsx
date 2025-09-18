import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';
import { PROJECT_NAME } from '@/constants/project';
import { getBountyUrl } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

import { type Notification } from '@/features/notifications/queries/useNotifications';
import { NotificationType } from '@/features/notifications/types';

import { styles } from './styles';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const CommentTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  let title;

  switch (notification.type) {
    case NotificationType.LISTING_COMMENT:
      title = (
        <strong>
          You&apos;ve received new comment in{' '}
          <a
            href={`${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}`}
            style={styles.link}
          >
            {notification.listing?.title}
          </a>
        </strong>
      );
      break;
    case NotificationType.SUBMISSION_COMMENT:
      title = (
        <strong>
          You&apos;ve received new comment in{' '}
          <a
            href={`${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}${notification.submission?.sequentialId}/`}
            style={styles.link}
          >
            {notification.listing?.title}
          </a>{' '}
          submission
        </strong>
      );
      break;
    case NotificationType.POW_COMMENT:
      title = (
        <strong>
          You&apos;ve received new comment in{' '}
          <a
            href={`${getURL()}feed/pow/${notification.powId}`}
            style={styles.link}
          >
            {notification.pow?.title}
          </a>{' '}
          Proof of Work
        </strong>
      );
      break;
    case NotificationType.NOTE_CREATED:
      title = (
        <strong>
          New note to{' '}
          <a
            href={`${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}${notification.submission?.sequentialId}/`}
            style={styles.link}
          >
            #{notification.submission?.sequentialId}
          </a>{' '}
          submission
        </strong>
      );
      break;
    case NotificationType.COMMENT_REPLY:
      title = <strong>You&apos;ve received new reply to your comment</strong>;
      break;
    case NotificationType.COMMENT_MENTIONED_YOU:
      title = <strong>You&apos;ve been mentioned in a comment</strong>;
      break;
    case NotificationType.COMMENT_PINNED:
      const comment =
        notification.comment?.type === 'INTERNAL_SUBMISSION_NOTES'
          ? 'Note'
          : 'Comment';
      title = <strong>{comment} has been pinned</strong>;
      break;
  }

  let username = notification?.actor
    ? (notification.actor.name ?? notification.actor.username)
    : notification?.sponsor?.name;
  let icon = notification?.actor
    ? notification.actor.photo
    : notification?.sponsor?.logo;

  if (!notification.actor && !notification.sponsor) {
    icon = '/favicon.ico';
    username = PROJECT_NAME;
  }

  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hey {notification.receiver.name},</p>
      <p
        style={{
          ...styles.textWithMargin,
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        {title}
      </p>
      <p
        style={{
          ...styles.textWithMargin,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src={icon}
          alt={username}
          style={{ width: '20px', height: '20px', borderRadius: '50%' }}
        />
        <span style={{ marginLeft: '10px' }}>{username}</span>
      </p>
      <p
        style={{
          ...styles.textWithMargin,
          fontSize: '16px',
          marginTop: '0px',
          padding: '12px',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          borderTopLeftRadius: '0px',
        }}
      >
        {notification.comment?.message}
      </p>
      <a
        href={`${getURL()}comment/${notification.commentId}`}
        style={{
          ...styles.textWithMargin,
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px',
          marginTop: '32px',
          padding: '8px',
          width: 'fit-content',
          textDecoration: 'none',
          backgroundColor: '#020617',
          color: 'white',
          borderRadius: '8px',
        }}
      >
        Go to NEARN <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
      </a>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
