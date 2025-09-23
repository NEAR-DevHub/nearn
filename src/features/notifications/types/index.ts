import {
  type WeeklyRoundupListing,
  type WeeklyRoundupSkill,
} from '@/email-templates/Listing/weeklyRoundupTemplate';

import { type Rewards } from '@/features/listings/types';
import { EventType } from '@/features/logging/types/event-data';

export const NotificationChannel = {
  EMAIL: 'email',
  IN_APP: 'inApp',
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationType = {
  [EventType.SUBMISSION_CREATED]: EventType.SUBMISSION_CREATED,
  SUBMISSION_RECEIVED: 'SUBMISSION_RECEIVED',
  [EventType.SUBMISSION_EDITED]: EventType.SUBMISSION_EDITED,
  LISTING_COMMENT: 'LISTING_COMMENT',
  SUBMISSION_COMMENT: 'SUBMISSION_COMMENT',
  POW_COMMENT: 'POW_COMMENT',
  NOTE_CREATED: 'NOTE_CREATED',
  COMMENT_REPLY: 'COMMENT_REPLY',
  COMMENT_MENTIONED_YOU: 'COMMENT_MENTIONED_YOU',
  [EventType.COMMENT_PINNED]: EventType.COMMENT_PINNED,
  [EventType.LISTING_WINNERS_ANNOUNCED]: EventType.LISTING_WINNERS_ANNOUNCED,
  [EventType.LISTING_EDITED]: EventType.LISTING_EDITED,
  DEADLINE_IN_3_DAYS: 'DEADLINE_IN_3_DAYS',
  DEADLINE_ENDED: 'DEADLINE_ENDED',
  DEADLINE_EXCEEDED_BY_WEEK: 'DEADLINE_EXCEEDED_BY_WEEK',
  [EventType.SUBMISSION_APPROVED]: EventType.SUBMISSION_APPROVED,
  [EventType.SUBMISSION_PAID]: EventType.SUBMISSION_PAID,
  [EventType.SUBMISSION_REJECTED]: EventType.SUBMISSION_REJECTED,
  TREASURY_PROPOSAL_STATUS_CHANGED: 'TREASURY_PROPOSAL_STATUS_CHANGED',
  [EventType.SPONSOR_MEMBER_INVITED]: EventType.SPONSOR_MEMBER_INVITED,
  [EventType.SPONSOR_MEMBER_ACCEPTED]: EventType.SPONSOR_MEMBER_ACCEPTED,
  [EventType.SCOUT_INVITE]: EventType.SCOUT_INVITE,
  LIKE: 'LIKE',

  WEEKLY_ROUNDUP: 'WEEKLY_ROUNDUP',
  NEW_LISTING_FOR_SKILLS: 'NEW_LISTING_FOR_SKILLS',
  PRODUCT_UPDATES_AND_NEWS: 'PRODUCT_UPDATES_AND_NEWS',
} as const;

export type NotificationDataMap = {
  [key in Exclude<
    NotificationType,
    | 'SUBMISSION_APPROVED'
    | 'LISTING_EDITED'
    | 'SPONSOR_MEMBER_INVITED'
    | 'TREASURY_PROPOSAL_STATUS_CHANGED'
    | 'SUBMISSION_PAID'
    | 'WEEKLY_ROUNDUP'
  >]: undefined;
} & {
  [EventType.SUBMISSION_APPROVED]: {
    token: string;
    rewards: Rewards;
    winnerPosition: keyof Rewards;
  };
  [NotificationType.LISTING_EDITED]: {
    changes: {
      field: string;
      newValue: string;
    }[];
  };
  [NotificationType.SPONSOR_MEMBER_INVITED]: {
    token?: string;
  };
  [NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED]: {
    status: 'approved' | 'rejected' | 'expired';
  };
  [NotificationType.SUBMISSION_PAID]: {
    link: string;
  };
  [NotificationType.WEEKLY_ROUNDUP]: {
    listings: WeeklyRoundupListing[];
    userSkills: WeeklyRoundupSkill[];
  };
};

export type NotificationData<T extends NotificationType> =
  NotificationDataMap[T];

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
