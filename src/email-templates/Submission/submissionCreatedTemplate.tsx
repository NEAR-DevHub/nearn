import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

import { styles } from '../styles';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const SubmissionCreatedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const submissionUrl = `${getBountyUrl(notification.listing as unknown as Listing)}${notification.submission?.sequentialId}`;

  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hi {notification.receiver.name},</p>
      <p style={styles.textWithMargin}>
        <strong>
          {notification.actor?.name || notification.actor?.username}
        </strong>{' '}
        has submitted to your listing{' '}
        <a href={submissionUrl} style={styles.link}>
          {notification.listing?.title}
        </a>
        .
      </p>
      <p style={styles.textWithMargin}>
        Review their submission and provide feedback to help them improve or
        approve their work.
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
