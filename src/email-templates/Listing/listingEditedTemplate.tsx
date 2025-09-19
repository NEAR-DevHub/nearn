import { Button, Link, Section, Text } from '@react-email/components';
import dayjs from 'dayjs';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';
import {
  type NotificationDataMap,
  type NotificationType,
} from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const ListingEditedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const listingUrl = getBountyUrl({
    ...(notification.listing as unknown as Listing),
    sponsor: notification.sponsor,
  });
  const changes =
    (notification.data as NotificationDataMap['LISTING_EDITED']).changes || [];
  console.log(changes);

  // Check if deadline was changed
  const deadlineChange = changes?.find((change) => change.field === 'deadline');
  const otherChanges = changes?.filter((change) => change.field !== 'deadline');

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        {deadlineChange ? (
          <>
            <Text className="text-slate-900">
              Quick heads up – the deadline for{' '}
              <Link
                href={listingUrl}
                className="font-medium text-slate-900 underline"
              >
                {notification.listing?.title}
              </Link>{' '}
              has been updated to{' '}
              <span className="font-medium">
                {dayjs(deadlineChange.newValue).format('MMM D, YYYY h:mm A')}
              </span>
              .
            </Text>
            {otherChanges.length > 0 && (
              <Text className="text-slate-900">
                Additional changes have also been made to the listing. Check it
                out and adjust your plans accordingly!
              </Text>
            )}
          </>
        ) : (
          <Text className="text-slate-900">
            The listing{' '}
            <Link
              href={listingUrl}
              className="font-medium text-slate-900 underline"
            >
              {notification.listing?.title}
            </Link>{' '}
            has been updated. Please review the changes to stay informed about
            any important updates.
          </Text>
        )}

        <Button
          href={listingUrl}
          className="inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          Go to NEARN <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
