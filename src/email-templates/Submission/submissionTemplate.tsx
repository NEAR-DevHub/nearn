import { Button, Section, Text } from '@react-email/components';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';

interface SubmissionProps {
  name: string;
  listingName: string;
  type: 'bounty' | 'project' | 'hackathon' | 'sponsorship';
  link: string;
}

export const SubmissionTemplate = ({
  name,
  listingName,
  type,
  link,
}: SubmissionProps) => {
  const getContent = () => {
    switch (type) {
      case 'project':
        return (
          <>
            <Text className="text-[16px] text-slate-900">
              Thank you for your submission! Your application for{' '}
              <a href={link} className="font-semibold text-slate-900 underline">
                {listingName}
              </a>{' '}
              has been successfully received. Congratulations on completing this
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
              <a href={link} className="font-semibold text-slate-900 underline">
                {listingName}
              </a>{' '}
              has been successfully received. Congratulations on completing this
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
              <a href={link} className="font-semibold text-slate-900 underline">
                {listingName}
              </a>{' '}
              has been successfully received. Congratulations on completing this
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
        <Button
          href={link}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          Go to {PROJECT_NAME}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
