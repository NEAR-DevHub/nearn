import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { styles } from '../styles';

interface TemplateProps {
  name: string;
  listingName: string;
  link: string;
}

export const WinnersAnnouncedTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hey {name},</p>
      <p style={styles.textWithMargin}>
        The recipients for the <strong>{listingName}</strong> opportunity have
        been selected!{' '}
        <p style={styles.text}>
          <a href={link} style={styles.link}>
            Click here
          </a>{' '}
          to see the results.
        </p>
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
