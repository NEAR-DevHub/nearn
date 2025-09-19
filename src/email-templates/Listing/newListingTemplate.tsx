import { type $Enums, type Prisma } from '@prisma/client';
import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

interface NewListingProps {
  name: string;
  link: string;
  listing: {
    id: string;
    title: string;
    region: string;
    skills: Prisma.JsonValue;
    type: $Enums.BountyType;
    slug: string;
    token: string | null;
    rewardAmount: number | null;
    sponsor: {
      name: string;
    };
  };
}

export const NewListingTemplate = ({
  name,
  link,
  listing,
}: NewListingProps) => {
  const listingType = listing.type.toLowerCase();
  const submitOrApply = listing.type === 'project' ? 'apply' : 'submit';
  const isUSDbased = listing.token === 'Any';
  const reward = listing.rewardAmount?.toLocaleString();
  const rewardText = reward ? reward + ' ' : '';
  return (
    <Email
      userName={name}
      preview={`New ${listingType} match: ${listing.title}`}
    >
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          {listing.sponsor.name} just posted a new {listingType} called{' '}
          <Link href={link} className="font-medium text-slate-900 underline">
            {listing.title} ({rewardText}{' '}
            {isUSDbased ? 'Any Token' : listing.token})
          </Link>{' '}
          that looks like a great match for your skills! Have a quick look at
          the scope of the {listingType} and make sure to {submitOrApply} before
          the deadline.
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          Pro tip: Subscribe to the {listingType} to get relevant updates on it.
        </Text>
        <Text className="text-base text-slate-600">
          Looking forward to seeing your submission!
        </Text>
      </Section>
    </Email>
  );
};
