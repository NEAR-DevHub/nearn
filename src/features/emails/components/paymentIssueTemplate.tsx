import React from 'react';

import { PROJECT_NAME } from '@/constants/project';

import { styles } from '../utils/styles';

interface TemplateProps {
  userName: string;
  userEmail: string;
  submissionId: string;
  listingTitle: string;
  description: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentDate: string;
  submissionUrl: string;
}

export const PaymentIssueTemplate = ({
  userName,
  userEmail,
  submissionId,
  listingTitle,
  description,
  paymentAmount,
  paymentCurrency,
  paymentDate,
  submissionUrl,
}: TemplateProps) => {
  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hello NEARN Team,</p>

      <p style={styles.textWithMargin}>
        A payment issue has been reported by a user on {PROJECT_NAME}.
      </p>

      <div
        style={{
          ...styles.textWithMargin,
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
        }}
      >
        <h3
          style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '16px' }}
        >
          Issue Details:
        </h3>

        <p style={{ margin: '8px 0', fontSize: '14px', color: '#6c757d' }}>
          <strong>User:</strong> {userName} ({userEmail})
        </p>

        <p style={{ margin: '8px 0', fontSize: '14px', color: '#6c757d' }}>
          <strong>Submission ID:</strong> {submissionId}
        </p>

        <p style={{ margin: '8px 0', fontSize: '14px', color: '#6c757d' }}>
          <strong>Listing:</strong> {listingTitle}
        </p>

        <p style={{ margin: '8px 0', fontSize: '14px', color: '#6c757d' }}>
          <strong>Payment Amount:</strong> {paymentAmount} {paymentCurrency}
        </p>

        <p style={{ margin: '8px 0', fontSize: '14px', color: '#6c757d' }}>
          <strong>Payment Date:</strong> {paymentDate}
        </p>

        <p
          style={{ margin: '12px 0 8px 0', fontSize: '14px', color: '#495057' }}
        >
          <strong>Issue Description:</strong>
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '14px',
            color: '#6c757d',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{description}&rdquo;
        </p>
      </div>

      <p style={styles.textWithMargin}>
        Please review this issue and take appropriate action. You can view the
        submission details{' '}
        <a href={submissionUrl} style={styles.link}>
          here
        </a>
        .
      </p>

      <p style={styles.salutation}>
        Best regards,
        <br />
        {PROJECT_NAME} System
      </p>
    </div>
  );
};
