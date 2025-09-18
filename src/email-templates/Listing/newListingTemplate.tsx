import { type $Enums, type Prisma } from '@prisma/client';
import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { styles } from '../styles';

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
    <div style={styles.container}>
      <p style={styles.greetings}>Hey {name},</p>
      <p style={styles.textWithMargin}>
        {listing.sponsor.name} just posted a new {listingType} called{' '}
        <a href={link} style={styles.link}>
          {listing.title} ({rewardText}{' '}
          {isUSDbased ? 'Any Token' : listing.token})
        </a>{' '}
        that looks like a great match for your skills! Have a quick look at the
        scope of the {listingType} and make sure to {submitOrApply} before the
        deadline.
      </p>
      <p style={styles.textWithMargin}>
        Pro tip: Subscribe to the {listingType} to get relevant updates on it.
      </p>
      <p style={styles.textWithMargin}>
        Looking forward to seeing your submission!
      </p>
      <Salutation />
      <p style={styles.text}>&nbsp;</p>
      <UnsubscribeLine />
    </div>
  );
};
