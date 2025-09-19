import { type CompensationType } from '@prisma/client';
import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getURL } from '@/utils/validUrl';

import { PROJECT_NAME } from '../../constants/project';

export interface WeeklyRoundupSkill {
  skills: string;
  subskills: string[];
}

export interface WeeklyRoundupListing {
  id: string;
  title: string;
  sponsor: string;
  slug: string;
  type: string;
  token: string | null;
  skills: any;
  usdValue: number | null;
  rewardAmount: number | null;
  compensationType: CompensationType;
  maxRewardAsk: number | null;
  minRewardAsk: number | null;
}

interface TemplateProps {
  name: string;
  listings: WeeklyRoundupListing[];
  userSkills: WeeklyRoundupSkill[];
}

const getReward = (listing: WeeklyRoundupListing) => {
  const formatNumber = (number: number) =>
    new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(
      number,
    );

  switch (listing.compensationType) {
    case 'fixed':
      return listing.rewardAmount !== null
        ? formatNumber(listing.rewardAmount)
        : 'N/A';
    case 'variable':
      return 'Variable';
    case 'range':
      const minFormatted =
        listing.minRewardAsk !== null
          ? formatNumber(listing.minRewardAsk)
          : 'N/A';
      const maxFormatted =
        listing.maxRewardAsk !== null
          ? formatNumber(listing.maxRewardAsk)
          : 'N/A';
      return `${minFormatted} - ${maxFormatted}`;
  }
};

const ListingItem = ({ listing }: { listing: WeeklyRoundupListing }) => (
  <li className="mb-2 text-base text-slate-600">
    <div>
      <Link
        href={`${getURL()}/listing/${
          listing.slug || ''
        }/?utm_source=${PROJECT_NAME}&utm_medium=email&utm_campaign=notifications`}
        className="font-medium text-slate-900 underline"
      >
        {listing.title}
      </Link>{' '}
      by {listing.sponsor} ({getReward(listing)}{' '}
      {listing.token === 'Any' ? 'in any token' : listing.token}{' '}
      {listing.type.toLowerCase()})
    </div>
  </li>
);

export const WeeklyRoundupTemplate = ({
  name,
  listings,
  userSkills,
}: TemplateProps) => {
  const groupedListings: Record<string, WeeklyRoundupListing[]> = {};
  const usedListings = new Set<string>();

  userSkills.forEach((userSkill) => {
    const skillListings = listings.filter(
      (listing) =>
        listing.skills.some(
          (skill: WeeklyRoundupSkill) => skill.skills === userSkill.skills,
        ) && !usedListings.has(listing.id),
    );

    if (skillListings.length > 0) {
      groupedListings[userSkill.skills] = skillListings.sort(
        (a, b) => (b.usdValue || 0) - (a.usdValue || 0),
      );
      skillListings.forEach((listing) => usedListings.add(listing.id));
    }
  });

  return (
    <Email userName={name} preview="Your weekly listing roundup">
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Here&apos;s a weekly round-up of all live listings, curated just for
          you:
        </Text>

        {Object.entries(groupedListings).map(([skill, skillListings]) => (
          <div key={skill}>
            <Text className="mb-2 mt-4 text-[15px] font-semibold leading-[18px]">
              {skill}
            </Text>
            <ol className="pl-5">
              {skillListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing} />
              ))}
            </ol>
          </div>
        ))}

        <Text className="mt-4 text-base text-slate-600">
          Hope to see you participate in (and hopefully win!) some of these :)
        </Text>
      </Section>
    </Email>
  );
};
