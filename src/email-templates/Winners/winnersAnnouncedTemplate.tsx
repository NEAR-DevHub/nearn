import { Link, Section, Text } from '@react-email/components';
import React from 'react';

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
          The recipients for the{' '}
          <span className="font-bold">{listingName}</span> opportunity have been
          selected!
        </Text>
        <Text className="text-base text-slate-600">
          <Link href={link} className="font-medium text-slate-900 underline">
            Click here
          </Link>{' '}
          to see the results.
        </Text>
      </Section>
    </Email>
  );
};
