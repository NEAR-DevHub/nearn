import dayjs from 'dayjs';
import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';
import {
  type NotificationDataMap,
  type NotificationType,
} from '@/features/notifications/types';

import { styles } from '../styles';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const ListingEditedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const listingUrl = getBountyUrl(notification.listing as unknown as Listing);
  const changes =
    (notification.data as NotificationDataMap['LISTING_EDITED']['changes']) ||
    [];

  // Check if deadline was changed
  const deadlineChange = changes.find((change) => change.field === 'deadline');
  const otherChanges = changes.filter((change) => change.field !== 'deadline');

  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hello {notification.receiver.name},</p>

      {deadlineChange ? (
        <>
          <p style={styles.textWithMargin}>
            Quick heads up – the deadline for{' '}
            <a href={listingUrl} style={styles.link}>
              {notification.listing?.title}
            </a>{' '}
            has been updated to{' '}
            <strong style={{ color: '#059669' }}>
              {dayjs(deadlineChange.newValue).format('MMM D, YYYY h:mm A')}
            </strong>
            .
          </p>
          {otherChanges.length > 0 && (
            <p style={styles.textWithMargin}>
              Additional changes have also been made to the listing. Check it
              out and adjust your plans accordingly!
            </p>
          )}
        </>
      ) : (
        <p style={styles.textWithMargin}>
          The listing{' '}
          <a href={listingUrl} style={styles.link}>
            {notification.listing?.title}
          </a>{' '}
          has been updated. Please review the changes to stay informed about any
          important updates.
        </p>
      )}

      <p style={styles.textWithMargin}>
        <a href={listingUrl} style={{ ...styles.link, fontWeight: 'semibold' }}>
          View the updated listing →
        </a>
      </p>

      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
