import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { styles } from '../styles';

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
    <div style={styles.container}>
      <p style={styles.greetings}>Hey {name},</p>
      <p style={styles.textWithMargin}>
        Friendly reminder that the listing &quot;
        <span style={{ fontWeight: 400 }}>{listingName}&quot;</span>{' '}
        you&nbsp;had indicated&nbsp;interest in will close in 3 days!{' '}
        <a href={link} style={styles.link}>
          Click here
        </a>{' '}
        to take another look.
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
