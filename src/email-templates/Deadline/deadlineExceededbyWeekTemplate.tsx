import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { HELP_URL, PROJECT_NAME } from '@/constants/project';
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
        <Text className="text-slate-900">
          <Link href={link} className="font-medium text-slate-900 underline">
            Click here
          </Link>{' '}
          to review the submissions.
        </Text>

        <Text className="text-slate-900">
          Reach out to{' '}
          <Link
            href={`${HELP_URL}`}
            className="font-medium text-slate-900 underline"
          >
            us
          </Link>{' '}
          in case you need help.
        </Text>
      </Section>
    </Email>
  );
};
