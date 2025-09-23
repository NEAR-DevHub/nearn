import { Button, Link, Section, Text } from '@react-email/components';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { PROJECT_NAME } from '../../constants/project';

interface TemplateProps {
  name: string | null;
  listingName: string;
  listingType: string;
  sponsorName: string;
  pocSocials: string | null;
  link: string;
}

export const WinnersTemplate = ({
  name,
  listingName,
  listingType,
  sponsorName,
  pocSocials,
  link,
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
            href={`${getURLSanitized(pocSocials || '')}/?utm_source=${PROJECT_NAME}&utm_medium=email&utm_campaign=notifications`}
            className="font-medium text-slate-900 underline"
          >
            here
          </Link>
          .
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
