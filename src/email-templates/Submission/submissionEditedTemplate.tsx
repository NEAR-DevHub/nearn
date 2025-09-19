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

export const SubmissionEditedTemplate = <T extends NotificationType>({
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
          <span className="font-medium">
            {notification.actor?.name || notification.actor?.username}
          </span>{' '}
          has edited their submission for{' '}
          <Link
            href={submissionUrl}
            className="font-medium text-slate-900 underline"
          >
            <span className="font-semibold">{notification.listing?.title}</span>
          </Link>
          .
        </Text>
        <Text className="text-[16px] text-slate-900">
          You may want to review the updated submission to see what changes have
          been made.
        </Text>
      </Section>
    </Email>
  );
};
