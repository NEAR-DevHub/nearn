import { Button, Link, Section, Text } from '@react-email/components';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const MilestonesEditedTemplate = <T extends NotificationType>({
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
          The milestones for your submission to{' '}
          <Link
            href={submissionUrl}
            className="font-medium text-slate-900 underline"
          >
            {notification.listing?.title}
          </Link>{' '}
          have been updated by{' '}
          <span className="font-semibold">{notification.sponsor?.name}</span>.
        </Text>
        <Text className="text-[16px] text-slate-900">
          Please review the updated milestones and make note of any changes to
          deadlines or requirements.
        </Text>

        <Button
          href={submissionUrl}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          View Updated Milestones
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
