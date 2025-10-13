import { Link, Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getURL } from '@/utils/validUrl';

import { PROJECT_NAME } from '../../constants/project';

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
    <Email userName={name || ''} preview="Payment received - Congratulations!">
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Congratulations! Your hard work has paid off. We&apos;re pleased to
          inform you that {isUSDbased && '$'}
          {amount} {isUSDbased && 'paid in '}
          {tokenName} has been processed and transferred to your account (
          {walletAddress}). This payment reflects the quality of your work and
          your valuable contribution.
        </Text>
        <Text className="text-base text-slate-600">
          We encourage you to share your accomplishment with your professional
          network. You can view your achievement on your profile and share it on
          social media.{' '}
          <Link
            href={`${getURL()}/t/${username}/?utm_source=${PROJECT_NAME}&utm_medium=email&utm_campaign=notifications`}
            className="font-medium text-slate-900 underline"
          >
            View your profile here
          </Link>{' '}
          to learn more.
        </Text>
      </Section>
    </Email>
  );
};
