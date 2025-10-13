import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

interface TemplateProps {
  name: string;
  listingName: string;
  link: string;
}

export const DeadlineThreeDaysTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <Email
      userName={name}
      preview={`Reminder: "${listingName}" closes in 3 days`}
    >
      <Section>
        <Text className="text-base text-slate-600">
          Friendly reminder that the listing &quot;
          <span className="font-normal">{listingName}</span>&quot; you had
          indicated interest in will close in 3 days!{' '}
          <Link href={link} className="font-medium text-slate-900 underline">
            Click here
          </Link>{' '}
          to take another look.
        </Text>
      </Section>
    </Email>
  );
};
