import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

interface ScoutInviteProps {
  name: string;
  link: string;
  sponsorName: string;
  listingName: string;
}

export const ScoutInviteTemplate = ({
  name,
  sponsorName,
  link,
  listingName,
}: ScoutInviteProps) => {
  return (
    <Email
      userName={name}
      preview={`${sponsorName} thinks you'd be perfect for "${listingName}"`}
    >
      <Section>
        <Text className="text-base text-slate-600">
          {sponsorName} is impressed with your profile and thinks you&apos;d be
          perfect for their new listing called{' '}
          <Link href={link} className="font-medium text-slate-900 underline">
            {listingName}
          </Link>
          . Interested? Submit now and stand a higher chance of winning!
        </Text>
      </Section>
    </Email>
  );
};
