import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

interface TemplateProps {
  name: string;
  listingName: string;
  link: string;
}

export const SubmissionRejectedTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <Email
      userName={name}
      preview={`Update on your application for ${listingName}`}
    >
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Unfortunately, your application for{' '}
          <Link href={link} className="font-medium text-slate-900 underline">
            {listingName}
          </Link>{' '}
          has been rejected. Please note that neither we nor the sponsor can
          share individual feedback on your application.
        </Text>
        <Text className="text-base text-slate-600">
          We hope you continue to add to your proof of work by submitting to
          more bounties and projects and winning some along the way! All the
          best.
        </Text>
      </Section>
    </Email>
  );
};
