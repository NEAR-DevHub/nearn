import { Button, Link, Section, Text } from '@react-email/components';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';
import { nthLabelGenerator } from '@/utils/rank';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
  isSponsor?: boolean;
}

export const MilestoneDeadlineComingUpTemplate = <T extends NotificationType>({
  notification,
  isSponsor = false,
}: TemplateProps<T>) => {
  const submissionUrl = `${getBountyUrl({
    ...(notification.listing as unknown as Listing),
    sponsor: notification.sponsor,
  })}${notification.submission?.sequentialId}/`;

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        <Text className="text-[16px] text-slate-900">
          This is a reminder that the deadline for {isSponsor ? 'your' : 'the'}{' '}
          <span className="font-semibold">
            {nthLabelGenerator(notification.milestone?.milestoneIndex || 1)}{' '}
            milestone
          </span>{' '}
          on{' '}
          <Link
            href={submissionUrl}
            className="font-medium text-slate-900 underline"
          >
            {notification.listing?.title}
          </Link>{' '}
          is coming up soon.
        </Text>

        <Text className="text-[16px] text-slate-900">
          {isSponsor
            ? 'Please be ready to review, approve and pay the milestone.'
            : 'Please ensure you complete the milestone requirements on time to avoid any delays in payment.'}
        </Text>

        <Button
          href={submissionUrl}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          View Milestone Details
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
