import { Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

interface SubmissionProps {
  name: string;
  listingName: string;
  type: 'bounty' | 'project' | 'hackathon' | 'sponsorship';
}

export const SubmissionTemplate = ({
  name,
  listingName,
  type,
}: SubmissionProps) => {
  const getContent = () => {
    switch (type) {
      case 'project':
        return (
          <>
            <Text className="text-[16px] text-slate-900">
              Thank you for your submission! Your application for{' '}
              <span className="font-semibold">{listingName}</span> has been
              successfully received. Congratulations on completing this
              milestone.
            </Text>
            <Text className="text-[16px] text-slate-900">
              The sponsor will review all applications in due course. We&apos;ll
              notify you by email when the selection process is complete and
              results are announced.
            </Text>
          </>
        );
      case 'bounty':
        return (
          <>
            <Text className="text-[16px] text-slate-900">
              Thank you for your submission! Your entry for{' '}
              <span className="font-semibold">{listingName}</span> has been
              successfully received. Congratulations on completing this
              milestone.
            </Text>
            <Text className="text-[16px] text-slate-900">
              Once the deadline passes, all submissions will be visible on the
              listing page. We&apos;ll notify you by email when the selection
              process is complete and results are announced.
            </Text>
          </>
        );
      case 'sponsorship':
        return (
          <>
            <Text className="text-[16px] text-slate-900">
              Thank you for your submission! Your entry for{' '}
              <span className="font-semibold">{listingName}</span> has been
              successfully received. Congratulations on completing this
              milestone.
            </Text>
            <Text className="text-[16px] text-slate-900">
              The sponsor will review all applications. We&apos;ll notify you by
              email when the sponsor approves or rejects your submission.
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Email userName={name}>
      <Section>
        <Text className="text-xl font-bold text-slate-900">
          Submission Received
        </Text>
        {getContent()}
      </Section>
    </Email>
  );
};
