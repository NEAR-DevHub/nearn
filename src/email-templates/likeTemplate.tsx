import {
  Button,
  Column,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

import { type Notification } from '@/features/notifications/queries/useNotifications';
import { type NotificationType } from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const LikeTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  let title;
  let link;

  if (notification.commentId) {
    title = (
      <Text className="text-xl font-bold text-slate-900">
        {notification.actor?.name || notification.actor?.username} liked your{' '}
        <Link
          href={`${getURL()}comment/${notification.commentId}`}
          className="font-medium text-slate-900 underline"
        >
          comment
        </Link>
      </Text>
    );
    link = `${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}`;
  } else if (notification.powId) {
    title = (
      <Text className="text-xl font-bold text-slate-900">
        {notification.actor?.name || notification.actor?.username} liked your
        Proof of Work{' '}
        <Link
          href={`${getURL()}feed/pow/${notification.powId}`}
          className="font-medium text-slate-900 underline"
        >
          {notification.pow?.title}
        </Link>
      </Text>
    );
    link = `${getURL()}feed/pow/${notification.powId}`;
  } else if (notification.submissionId) {
    title = (
      <Text className="text-xl font-bold text-slate-900">
        {notification.actor?.name || notification.actor?.username} liked your
        submission for{' '}
        <Link
          href={`${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}${notification.submission?.sequentialId}/`}
          className="font-medium text-slate-900 underline"
        >
          {notification.listing?.title}
        </Link>
      </Text>
    );
    link = `${getBountyUrl({ ...notification.listing, sponsor: notification.sponsor } as any)}${notification.submission?.sequentialId}/`;
  }

  const username = notification.actor?.name || notification.actor?.username;
  const icon = notification.actor?.photo;

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        {title}

        {icon && username && (
          <Row className="mt-4 flex">
            <Column className="w-min">
              <Img
                src={icon}
                alt={username}
                width="40"
                height="40"
                className="mr-2 rounded-full"
              />
            </Column>
            <Column>
              <Text className="ml-2 text-left font-semibold text-slate-900">
                {username}
              </Text>
            </Column>
          </Row>
        )}

        {link && (
          <Button
            href={link}
            className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
          >
            View on NEARN
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </Section>
    </Email>
  );
};
