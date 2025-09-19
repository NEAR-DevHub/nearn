import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { UnsubscribeLine } from '@/email-templates/UnsubscribeLine';

interface EmailProps {
  children: React.ReactNode;
  userName?: string;
  preview?: string;
}

export const Email = ({ children, userName, preview }: EmailProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: '#007291',
                primary: '#020617',
                border: '#E2E8F0',
              },
            },
          },
        }}
      >
        <Body className="bg-white font-['Inter',sans-serif]">
          <Container className="mx-auto max-w-[650px] p-8">
            {userName && (
              <Text className="text-xl font-semibold text-slate-600">
                Hey {userName},
              </Text>
            )}
            <Section className="flex flex-col gap-8 pt-4">
              {children}
              <Hr className="mt-8 border-slate-200" />
              <Text className="mt-8 whitespace-pre-line text-slate-900">
                Best regards,{'\n'}
                {PROJECT_NAME}
              </Text>
              <UnsubscribeLine />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
