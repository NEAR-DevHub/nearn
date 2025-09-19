import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const SubmissionCreatedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const submissionUrl = `${getBountyUrl({
    ...(notification.listing as unknown as Listing),
    sponsor: notification.sponsor,
  })}${notification.submission?.sequentialId}/`;

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        <Text className="text-[16px] text-slate-900">
          <span className="font-semibold">
            {notification.actor?.name || notification.actor?.username}
          </span>{' '}
          has submitted to your listing{' '}
          <Link
            href={submissionUrl}
            className="font-medium text-slate-900 underline"
          >
            {notification.listing?.title}
          </Link>
          .
        </Text>
        <Text className="text-[16px] text-slate-900">
          Review their submission and provide feedback to help them improve or
          approve their work.
        </Text>
      </Section>
    </Email>
  );
};
