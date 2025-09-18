import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';
import { HELP_URL, PROJECT_NAME } from '@/constants/project';
import { styles } from '@/email-templates/styles';

interface TemplateProps {
  name: string;
  listingName: string;
  link: string;
}

export const DeadlineExceededbyWeekTemplate = ({
  name,
  listingName,
  link,
}: TemplateProps) => {
  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hey {name},</p>
      <p style={styles.textWithMargin}>
        It has been 7 days since the <strong>{listingName}</strong> listing
        expired. We suggest you announce your selection/s on {PROJECT_NAME}{' '}
        soon!
      </p>
      <p style={styles.textWithMargin}>
        <a href={link} style={styles.link}>
          Click here
        </a>{' '}
        to review the submissions.
      </p>

      <p style={styles.textWithMargin}>
        Reach out to{' '}
        <a href={`${HELP_URL}`} style={styles.link}>
          us
        </a>{' '}
        in case you need help.
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
