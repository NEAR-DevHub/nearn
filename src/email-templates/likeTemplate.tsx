import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';
import { getBountyUrl } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

import { styles } from './styles';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const LikeTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  let title;
  let link;

  if (notification.listingId) {
    title = (
      <strong>
        {notification.actor?.name || notification.actor?.username} liked your
        listing{' '}
        <a
          href={`${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}`}
          style={styles.link}
        >
          {notification.listing?.title}
        </a>
      </strong>
    );
    link = `${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}`;
  } else if (notification.powId) {
    title = (
      <strong>
        {notification.actor?.name || notification.actor?.username} liked your
        Proof of Work{' '}
        <a
          href={`${getURL()}feed/pow/${notification.powId}`}
          style={styles.link}
        >
          {notification.pow?.title}
        </a>
      </strong>
    );
    link = `${getURL()}feed/pow/${notification.powId}`;
  } else if (notification.submissionId) {
    title = (
      <strong>
        {notification.actor?.name || notification.actor?.username} liked your
        submission for{' '}
        <a
          href={`${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}${notification.submission?.sequentialId}/`}
          style={styles.link}
        >
          {notification.listing?.title}
        </a>
      </strong>
    );
    link = `${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}${notification.submission?.sequentialId}/`;
  }

  const username = notification.actor?.name || notification.actor?.username;
  const icon = notification.actor?.photo;

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
      {icon && username && (
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
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
          <span style={{ marginLeft: '10px', fontWeight: 'semibold' }}>
            {username}
          </span>
        </p>
      )}
      {link && (
        <a
          href={link}
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
          View on NEARN{' '}
          <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
        </a>
      )}
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
