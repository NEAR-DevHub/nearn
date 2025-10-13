import { Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

interface AlertProps {
  type: string;
  id?: string;
  userId?: string;
  otherInfo?: string;
  errorMessage: string;
}

export const AlertTemplate = ({
  type,
  id,
  userId,
  otherInfo,
  errorMessage,
}: AlertProps) => {
  return (
    <Email preview="Error Report">
      <Section>
        <Text className="mb-4 text-2xl font-bold text-slate-900">
          Error Report
        </Text>
        <Text className="mb-4 text-base text-slate-600">
          Could not send email for type{' '}
          <span className="font-bold">{type}</span> to id{' '}
          <span className="font-bold">{id}</span>.
        </Text>
        {userId && (
          <Text className="mb-2 text-base text-slate-600">
            User ID: <span className="font-bold">{userId}</span>
          </Text>
        )}
        {otherInfo && (
          <Text className="mb-2 text-base text-slate-600">
            Additional Information:{' '}
            <span className="font-bold">{otherInfo}</span>
          </Text>
        )}
        <Text className="text-base text-slate-600">
          Error Message: {errorMessage}
        </Text>
      </Section>
    </Email>
  );
};
