import { Section, Text } from '@react-email/components';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';

import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const SponsorMemberAcceptedTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  return (
    <Email
      userName={notification.receiver.name}
      preview={`${notification.actor?.name || notification.actor?.username} has joined ${notification.sponsor?.name}`}
    >
      <Section>
        <Text className="mb-4 text-base text-slate-600">
          Great news! {notification.actor?.name || notification.actor?.username}{' '}
          has accepted invitation to join{' '}
          <span className="font-semibold">{notification.sponsor?.name}</span>.
        </Text>
        <Text className="text-base text-slate-600">
          They now have access to your sponsor dashboard and can help manage
          listings, review submissions, and collaborate with your team.
        </Text>
      </Section>
    </Email>
  );
};
