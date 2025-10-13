import { Button, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';
import { type Notification } from '@/features/notifications/queries/useNotifications';

interface TemplateProps {
  notification: Notification<'TREASURY_PROPOSAL_STATUS_CHANGED'>;
}

export const TreasuryProposalStatusChangedTemplate = ({
  notification,
}: TemplateProps) => {
  const status = notification.data.status;
  const statusText =
    status === 'approved'
      ? 'approved'
      : status === 'rejected'
        ? 'rejected'
        : 'expired';
  const statusColorClass =
    status === 'approved'
      ? 'text-green-600'
      : status === 'rejected'
        ? 'text-red-600'
        : 'text-amber-500';

  return (
    <Email
      userName={notification.receiver.name}
      preview={`Your treasury proposal has been ${statusText}`}
    >
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Your treasury proposal has been{' '}
          <span className={`${statusColorClass} font-semibold`}>
            {statusText}
          </span>
          .
        </Text>
        {status === 'approved' && (
          <Text className="text-base text-slate-600">
            We noticed that treasury payment has been approved. No extra steps
            are required.
          </Text>
        )}
        {status === 'rejected' && (
          <Text className="text-base text-slate-600">
            Unfortunately, your payment proposal has been rejected. Please
            provide another method of payment for the recipient.
          </Text>
        )}
        {status === 'expired' && (
          <Text className="text-base text-slate-600">
            Your payment proposal has expired due to inactivity. Please submit a
            new proposal or pay submission using another method for the
            recipient.
          </Text>
        )}

        <Button
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
          href={`${getBountyUrl({
            ...notification.listing,
            sponsor: notification.sponsor,
          } as Listing)}${notification.submission?.sequentialId}/`}
        >
          View Submission
        </Button>
      </Section>
    </Email>
  );
};
