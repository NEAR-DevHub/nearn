import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { styles } from '../styles';

interface SubmissionProps {
  name: string;
  listingName: string;
  type: 'bounty' | 'project' | 'hackathon' | 'sponsorship';
}

export const SubmissionTemplate = ({
  name,
  listingName,
  type,
}: SubmissionProps) => {
  let node;
  switch (type) {
    case 'project':
      node = (
        <>
          <p style={styles.textWithMargin}>
            Thank you for your submission! Your application for{' '}
            <strong>{listingName}</strong> has been successfully received.
            Congratulations on completing this milestone.
          </p>
          <p style={styles.textWithMargin}>
            The sponsor will review all applications in due course. We&apos;ll
            notify you by email when the selection process is complete and
            results are announced.
          </p>
        </>
      );
      break;
    case 'bounty':
      node = (
        <>
          <p style={styles.textWithMargin}>
            Thank you for your submission! Your entry for{' '}
            <strong>{listingName}</strong> has been successfully received.
            Congratulations on completing this milestone.
          </p>
          <p style={styles.textWithMargin}>
            Once the deadline passes, all submissions will be visible on the
            listing page. We&apos;ll notify you by email when the selection
            process is complete and results are announced.
          </p>
        </>
      );
      break;
    case 'sponsorship':
      node = (
        <>
          <p style={styles.textWithMargin}>
            Thank you for your submission! Your entry for{' '}
            <strong>{listingName}</strong> has been successfully received.
            Congratulations on completing this milestone.
          </p>
          <p style={styles.textWithMargin}>
            The sponsor will review all applications. We&apos;ll notify you by
            email when the sponsor approves or rejects your submission.
          </p>
        </>
      );
      break;
  }
  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hello {name},</p>
      {node}
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
