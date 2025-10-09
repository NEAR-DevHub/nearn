import { NotificationRelationType } from '@prisma/client';

import { EventType } from '@/features/logging/types/event-data';
import { NotificationType } from '@/features/notifications/types';

import { AlertChannel } from '../types';

export const sections = {
  [NotificationRelationType.SPONSOR]: [
    {
      title: 'New submissions received for listing',
      type: EventType.SUBMISSION_CREATED,
    },
    {
      title: 'Submission edited',
      type: EventType.SUBMISSION_EDITED,
    },
    {
      title: 'Comments received on listing',
      type: NotificationType.LISTING_COMMENT,
    },
    {
      title: 'Deadline related reminders',
      types: [NotificationType.DEADLINE_EXCEEDED_BY_WEEK],
    },
    {
      title: 'Notes received on submission',
      type: NotificationType.NOTE_CREATED,
    },
    {
      title: 'NEAR Treasury Related Notifications',
      types: [NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED],
    },
    {
      title: 'New member joined your team',
      type: NotificationType.SPONSOR_MEMBER_ACCEPTED,
    },
  ],
  [NotificationRelationType.TALENT]: [
    {
      title: 'New comments on my submission',
      type: NotificationType.SUBMISSION_COMMENT,
    },
    {
      title: 'My submission statuses',
      types: [
        NotificationType.SUBMISSION_APPROVED,
        NotificationType.SUBMISSION_REJECTED,
        NotificationType.SUBMISSION_PAID,
        NotificationType.SUBMISSION_RECEIVED,
      ],
    },
    {
      title: 'Deadline related reminders',
      type: NotificationType.DEADLINE_IN_3_DAYS,
    },
    {
      title: 'Listing related notifications',
      types: [
        NotificationType.LISTING_WINNERS_ANNOUNCED,
        NotificationType.LISTING_EDITED,
      ],
    },
    {
      title: 'New listings added for my skills',
      type: NotificationType.NEW_LISTING_FOR_SKILLS,
      disabled: [AlertChannel.IN_APP],
    },
    {
      title: 'Weekly roundup of new listings',
      type: NotificationType.WEEKLY_ROUNDUP,
      disabled: [AlertChannel.IN_APP],
    },
    {
      title: 'New comments on my Proof of Work',
      type: NotificationType.POW_COMMENT,
    },
    {
      title: 'Scout invitation',
      types: [NotificationType.SCOUT_INVITE],
    },
  ],
  GENERAL: [
    {
      title: 'Comment replies, pinned and tags',
      types: [
        NotificationType.COMMENT_REPLY,
        NotificationType.COMMENT_MENTIONED_YOU,
        NotificationType.COMMENT_PINNED,
      ],
    },
    {
      title: 'Likes',
      type: NotificationType.LIKE,
    },
    {
      title: 'Product updates and newsletters',
      type: NotificationType.PRODUCT_UPDATES_AND_NEWS,
      disabled: [AlertChannel.IN_APP],
    },
  ],
};

export const CHANNEL_LABELS = {
  [AlertChannel.EMAIL]: 'Email',
  [AlertChannel.IN_APP]: 'In-App',
};

export const SPONSOR_ALERT_COLUMN_WIDTHS = ['64px', '48px', '48px'];
export const BASIC_ALERT_COLUMN_WIDTHS = ['48px', '48px'];
