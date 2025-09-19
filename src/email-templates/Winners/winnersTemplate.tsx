import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

import { PROJECT_NAME } from '../../constants/project';

interface TemplateProps {
  name: string | null;
  listingName: string;
  listingType: string;
  sponsorName: string;
  pocSocials: string | null;
}

export const WinnersTemplate = ({
  name,
  listingName,
  listingType,
  sponsorName,
  pocSocials,
}: TemplateProps) => {
  return (
    <Email
      userName={name || undefined}
      preview={`Congratulations! Your submission for ${listingName} is approved`}
    >
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Congrats your submission is approved for the{' '}
          <span className="font-bold">{listingName}</span> {listingType}!
        </Text>
        <Text className="text-base text-slate-600">
          {sponsorName} will be sending your reward directly into your wallet.
          No action is needed from your end. If you need to contact the sponsor,
          you can do so from{' '}
          <Link
            href={`${pocSocials}/?utm_source=${PROJECT_NAME}&utm_medium=email&utm_campaign=notifications`}
            className="font-medium text-slate-900 underline"
          >
            here
          </Link>
          .
        </Text>
      </Section>
    </Email>
  );
};
