import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { CHAIN_NAME, HELP_URL, PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';

export const WelcomeSponsorTemplate = () => {
  return (
    <Email preview={`Welcome to ${PROJECT_NAME}!`}>
      <Section>
        <Text className="mb-4 text-xl font-semibold text-slate-900">
          Welcome to {PROJECT_NAME}!
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          Thanks for signing up! Welcome to {PROJECT_NAME}!
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          {PROJECT_NAME} is {CHAIN_NAME}&apos;s talent-matching platform,
          bringing ecosystem partners, organizations, and talent together to put{' '}
          {CHAIN_NAME}&apos;s projects on the map.
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          We are confident you will find many talented people to recruit for
          your projects, bounties, and freelance opportunities. Jump right in
          and get your first listing started! Soon, you will have plenty of
          submissions to review.
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          If you need any help related to setting up your listing on{' '}
          {PROJECT_NAME}, don&apos;t hesitate to{' '}
          <Link
            href={HELP_URL}
            className="font-medium text-slate-900 underline"
          >
            contact us
          </Link>
          .
        </Text>
        <Text className="text-base font-medium text-slate-600">
          Happy building!
        </Text>
      </Section>
    </Email>
  );
};
