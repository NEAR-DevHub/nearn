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

import { PROJECT_NAME } from '@/constants/project';
import { Email } from '@/email-templates/BasicEmail';
import { getBountyUrl } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

import { type Notification } from '@/features/notifications/queries/useNotifications';
import { NotificationType } from '@/features/notifications/types';

interface TemplateProps<T extends NotificationType> {
  notification: Notification<T>;
}

export const CommentTemplate = <T extends NotificationType>({
  notification,
}: TemplateProps<T>) => {
  const getTitle = () => {
    switch (notification.type) {
      case NotificationType.LISTING_COMMENT:
        return (
          <Text className="text-xl font-bold text-slate-900">
            You&apos;ve received new comment in{' '}
            <Link
              href={`${getBountyUrl({
                ...notification.listing,
                sponsor: notification.sponsor,
              } as any)}`}
              className="text-brand underline"
            >
              {notification.listing?.title}
            </Link>
          </Text>
        );
      case NotificationType.SUBMISSION_COMMENT:
        return (
          <Text className="text-xl font-bold text-slate-900">
            You&apos;ve received new comment in{' '}
            <Link
              href={`${getBountyUrl({
                ...notification.listing,
                sponsor: notification.sponsor,
              } as any)}${notification.submission?.sequentialId}/`}
              className="text-brand underline"
            >
              {notification.listing?.title}
            </Link>{' '}
            submission
          </Text>
        );
      case NotificationType.POW_COMMENT:
        return (
          <Text className="text-xl font-bold text-slate-900">
            You&apos;ve received new comment in{' '}
            <Link
              href={`${getURL()}feed/pow/${notification.powId}`}
              className="text-brand underline"
            >
              {notification.pow?.title}
            </Link>{' '}
            Proof of Work
          </Text>
        );
      case NotificationType.NOTE_CREATED:
        return (
          <Text className="text-xl font-bold text-slate-900">
            New note to{' '}
            <Link
              href={`${getBountyUrl({
                ...notification.listing,
                sponsor: notification.sponsor,
              } as any)}${notification.submission?.sequentialId}/`}
              className="text-brand underline"
            >
              #{notification.submission?.sequentialId}
            </Link>{' '}
            submission
          </Text>
        );
      case NotificationType.COMMENT_REPLY:
        return (
          <Text className="text-xl font-bold text-slate-900">
            You&apos;ve received new reply to your comment
          </Text>
        );
      case NotificationType.COMMENT_MENTIONED_YOU:
        return (
          <Text className="text-xl font-bold text-slate-900">
            You&apos;ve been mentioned in a comment
          </Text>
        );
      case NotificationType.COMMENT_PINNED:
        const commentType =
          notification.comment?.type === 'INTERNAL_SUBMISSION_NOTES'
            ? 'Note'
            : 'Comment';
        return (
          <Text className="text-xl font-bold text-slate-900">
            {commentType} has been pinned
          </Text>
        );
      default:
        return null;
    }
  };

  const username = notification?.actor
    ? (notification.actor.name ?? notification.actor.username)
    : (notification?.sponsor?.name ?? PROJECT_NAME);

  const icon = notification?.actor
    ? notification.actor.photo
    : (notification?.sponsor?.logo ?? '/favicon.ico');

  return (
    <Email userName={notification.receiver.name}>
      <Section>
        {getTitle()}

        <Row className="flex">
          <Column className="w-min">
            <Img
              src={icon}
              alt={username}
              width="24"
              height="24"
              className="mr-2 rounded-full"
            />
          </Column>
          <Column>
            <Text className="text-left text-slate-900">{username}</Text>
          </Column>
        </Row>
        <Text
          className="my-0 rounded-lg rounded-tl-none p-3"
          style={{ border: '1px solid #E2E8F0' }}
        >
          {notification.comment?.message}
        </Text>

        <Button
          href={`${getURL()}comment/${notification.commentId}`}
          className="mt-8 inline-flex items-center rounded-lg bg-[#020617] px-4 py-2 text-white no-underline"
        >
          Go to NEARN
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Section>
    </Email>
  );
};
