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

export const SubmissionEditedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const submissionUrl = `${getBountyUrl(notification.listing as unknown as Listing)}${notification.submission?.sequentialId}`;

  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hi {notification.receiver.name},</p>
      <p style={styles.textWithMargin}>
        {notification.actor?.name || notification.actor?.username} has edited
        their submission for{' '}
        <a href={submissionUrl} style={styles.link}>
          {notification.listing?.title}
        </a>
        .
      </p>
      <p style={styles.textWithMargin}>
        You may want to review the updated submission to see what changes have
        been made.
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
