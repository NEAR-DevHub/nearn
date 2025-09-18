import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

import { styles } from '../styles';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const SponsorMemberAcceptedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hi {notification.receiver.name},</p>
      <p style={styles.textWithMargin}>
        Great news! {notification.actor?.name || notification.actor?.username}{' '}
        has accepted your invitation to join{' '}
        <span style={{ fontWeight: 'semibold' }}>
          {notification.sponsor?.name}
        </span>
        .
      </p>
      <p style={styles.textWithMargin}>
        They now have access to your sponsor dashboard and can help manage
        listings, review submissions, and collaborate with your team.
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
