import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Button, Section, Text } from '@react-email/components';
import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';

interface TemplateProps {
  name: string;
  listingName: string;
  link: string;
}

export const DeadlineExceededbyWeekTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <Email userName={name}>
      <Section>
        <Text className="text-slate-900">
          It has been 7 days since the{' '}
          <span className="font-semibold">{listingName}</span> listing expired.
          We suggest you announce your selection/s on {PROJECT_NAME} soon!
        </Text>
        <Button
          href={link}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          Go to NEARN
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
