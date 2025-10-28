import { Button, Link, Section, Text } from '@react-email/components';
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

export const SubmissionCancelledTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const submissionUrl = `${getBountyUrl({
    ...(notification.listing as unknown as Listing),
    sponsor: notification.sponsor,
  })}${notification.submission?.sequentialId}/`;

  const reason = (
    notification.data as NotificationDataMap['SUBMISSION_CANCELLED']
  )?.reason;

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        <Text className="text-[16px] text-slate-900">
          <span className="font-semibold">{notification.sponsor?.name}</span>{' '}
          has cancelled the remaining milestones for your submission to{' '}
          <Link
            href={submissionUrl}
            className="font-medium text-slate-900 underline"
          >
            {notification.listing?.title}
          </Link>
          .
        </Text>
        <Text className="text-[16px] text-slate-900">
          Any completed milestones will still be paid. Please contact the
          sponsor if you have any questions or concerns about this decision.
        </Text>
        {reason && reason.length > 0 && (
          <Text
            className="my-0 rounded-lg rounded-tl-none p-3"
            style={{ border: '1px solid #E2E8F0' }}
          >
            {reason}
          </Text>
        )}

        <Button
          href={submissionUrl}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          View Details
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
