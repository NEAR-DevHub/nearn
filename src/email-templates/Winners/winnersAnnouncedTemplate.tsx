import { Button, Section, Text } from '@react-email/components';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';

interface TemplateProps {
  name: string;
  listingName: string;
  link: string;
}

export const WinnersAnnouncedTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <Email userName={name} preview={`Winners announced for ${listingName}`}>
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          The listing{' '}
          <a href={link} className="font-bold text-slate-600 underline">
            {listingName}
          </a>{' '}
          announced the results! Check it out on {PROJECT_NAME}
        </Text>
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
