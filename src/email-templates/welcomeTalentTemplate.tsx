import { Section, Text } from '@react-email/components';
import React from 'react';

import { CHAIN_NAME, PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';

export const WelcomeTalentTemplate = () => {
  return (
    <Email preview={`Welcome to ${PROJECT_NAME}!`}>
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Thanks for signing up! Welcome to {PROJECT_NAME}!
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          {PROJECT_NAME} is {CHAIN_NAME}&apos;s talent-matching platform,
          bringing ecosystem partners, organizations, and talent together to put{' '}
          {CHAIN_NAME}&apos;s projects on the map.
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          You will find some of the biggest and brightest companies,
          organizations, and sponsors across the {CHAIN_NAME} ecosystem. We are
          confident that if you are seeking opportunities, you will find them
          here!
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          You can access the listings by hitting the front page, choosing one of
          the areas at the top, and perusing the listings. When you&apos;re
          ready, submit! Don&apos;t be shy.
        </Text>
        <Text className="text-base font-medium text-slate-600">
          Happy hunting!
        </Text>
      </Section>
    </Email>
  );
};
