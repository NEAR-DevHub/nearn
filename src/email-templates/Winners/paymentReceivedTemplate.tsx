import React from 'react';

import { Salutation } from '@/components/email-templates/salutation';
import { UnsubscribeLine } from '@/components/email-templates/unsubscribeLine';
import { getURL } from '@/utils/validUrl';

import { PROJECT_NAME } from '../../constants/project';
import { styles } from '../styles';

interface TemplateProps {
  name: string | null;
  amount: number;
  tokenName: string | null;
  walletAddress: string | null;
  username: string | null;
  isUSDbased: boolean;
}

export const PaymentReceivedTemplate = ({
  name,
  amount,
  tokenName,
  walletAddress,
  username,
  isUSDbased,
}: TemplateProps) => {
  return (
    <div style={styles.container}>
      <p style={styles.greetings}>Hello {name},</p>
      <p style={styles.textWithMargin}>
        Congratulations! Your hard work has paid off. We&apos;re pleased to
        inform you that {isUSDbased && '$'}
        {amount} {isUSDbased && 'paid in '}
        {tokenName} has been processed and transferred to your account (
        {walletAddress}). This payment reflects the quality of your work and
        your valuable contribution.
      </p>
      <p style={styles.textWithMargin}>
        We encourage you to share your accomplishment with your professional
        network. You can view your achievement on your profile and share it on
        social media.{' '}
        <a
          href={`${getURL()}/t/${username}/?utm_source=${PROJECT_NAME}&utm_medium=email&utm_campaign=notifications`}
          style={styles.link}
        >
          View your profile here
        </a>{' '}
        to learn more.
      </p>
      <Salutation />
      <UnsubscribeLine />
    </div>
  );
};
