import { Section, Text } from '@react-email/components';
import React from 'react';

import { PROJECT_NAME } from '@/constants/project';

import { Email } from './BasicEmail';

interface TemplateProps {
  token: string;
}

export const OTPTemplate = ({ token }: TemplateProps) => {
  return (
    <Email userName={''}>
      <Section>
        <Text className="text-base font-medium text-slate-600">
          Your OTP for logging into {PROJECT_NAME} is <b>{token}</b>. This OTP
          is valid for 30 minutes.
        </Text>
      </Section>
    </Email>
  );
};
