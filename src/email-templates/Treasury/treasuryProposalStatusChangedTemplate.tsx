import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';

import { type Notification } from '@/features/notifications/queries/useNotifications';

import { styles } from '../styles';

interface TemplateProps {
  notification: Notification<'TREASURY_PROPOSAL_STATUS_CHANGED'>;
}

export const TreasuryProposalStatusChangedTemplate = ({
  notification,
}: TemplateProps) => {
  const status = notification.data.status;
  const statusText =
    status === 'approved'
      ? 'approved'
      : status === 'rejected'
        ? 'rejected'
        : 'expired';
  const statusColor =
    status === 'approved'
      ? '#059669'
      : status === 'rejected'
        ? '#DC2626'
        : '#F59E0B';

  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hi {notification.receiver.name},</p>
      <p style={styles.textWithMargin}>
        Your treasury proposal has been{' '}
        <span style={{ color: statusColor, fontWeight: 'semibold' }}>
          {statusText}
        </span>
        .
      </p>
      {status === 'approved' && (
        <p style={styles.textWithMargin}>
          We noticed that treasury payment has been approved. No extra steps are
          required.
        </p>
      )}
      {status === 'rejected' && (
        <p style={styles.textWithMargin}>
          Unfortunately, your payment proposal has been rejected. Please provide
          another method of payment.
        </p>
      )}
      {status === 'expired' && (
        <p style={styles.textWithMargin}>
          Your payment proposal has expired due to inactivity. Please submit a
          new proposal or pay submission using another method.
        </p>
      )}
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
