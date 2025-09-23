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

export const DeadlineEndedTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <Email userName={name}>
      <Section>
        <Text className="text-slate-900">
          The deadline for your listing <strong>{listingName}</strong>
          &nbsp; has expired. Check out {PROJECT_NAME} to announce your
          selections or start a new listing!
        </Text>

        <Button
          href={link}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          Review submissions
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
