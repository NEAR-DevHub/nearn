import { Button, Section, Text } from '@react-email/components';
import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';

interface TemplateProps {
  senderName: string;
  sponsorName: string;
  link: string;
}

export const InviteMemberTemplate = ({
  senderName,
  sponsorName,
  link,
}: TemplateProps) => {
  return (
    <Email
      userName={senderName}
      preview={`You have been invited to join ${sponsorName} on ${PROJECT_NAME}`}
    >
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          You have been invited by {senderName} to join{' '}
          <strong>{sponsorName}</strong> on {PROJECT_NAME}!{' '}
          <Button
            href={link}
            className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
          >
            Accept invite
          </Button>
        </Text>
      </Section>
    </Email>
  );
};
