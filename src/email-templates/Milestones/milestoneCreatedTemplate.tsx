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
  isSingleMilestone: boolean;
}

export const MilestoneCreatedTemplate = <T extends NotificationType>({
  notification,
  isSingleMilestone,
}: TemplateProps<T>) => {
  const submissionUrl = `${getBountyUrl({
    ...(notification.listing as unknown as Listing),
    sponsor: notification.sponsor,
  })}${notification.submission?.sequentialId}/`;

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        <Text className="text-[16px] text-slate-900">
          <span className="font-semibold">{notification.sponsor?.name}</span>{' '}
          has set payment type:{' '}
          <span className="font-medium">
            {isSingleMilestone ? 'Full payment' : 'Milestone-based'}
          </span>{' '}
          for your submission to{' '}
          <Link
            href={submissionUrl}
            className="font-medium text-slate-900 underline"
          >
            {notification.listing?.title}
          </Link>
          .
        </Text>
        <Text className="text-[16px] text-slate-900">
          {isSingleMilestone
            ? 'This means your submission has been approved for full payment upon completion.'
            : 'This means your submission has been selected for milestone-based work. Please review the milestone details and deadlines to plan your work accordingly.'}
        </Text>

        <Button
          href={submissionUrl}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          Go to NEARN
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
