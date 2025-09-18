import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { PROJECT_NAME } from '../../constants/project';
import { styles } from '../styles';

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
    <div style={styles.container}>
      <p style={styles.greetings}>Hey {name},</p>
      <p style={styles.textWithMargin}>
        Congrats your submission is approved for the{' '}
        <strong>{listingName}</strong> {listingType}!
      </p>
      <p style={styles.text}>
        {sponsorName} will be sending your reward directly into your wallet. No
        action is needed from your end. If you need to contact the sponsor, you
        can do so from{' '}
        <a
          href={`${pocSocials}/?utm_source=${PROJECT_NAME}&utm_medium=email&utm_campaign=notifications`}
          style={styles.link}
        >
          here
        </a>
        .
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
