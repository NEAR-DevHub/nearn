import { EventType } from '@/features/logging/types/event-data';

export const NotificationChannel = {
  EMAIL: 'email',
  IN_APP: 'inApp',
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationType = {
  [EventType.SUBMISSION_CREATED]: EventType.SUBMISSION_CREATED,
  [EventType.SUBMISSION_EDITED]: EventType.SUBMISSION_EDITED,
  LISTING_COMMENT: 'LISTING_COMMENT',
  SUBMISSION_COMMENT: 'SUBMISSION_COMMENT',
  POW_COMMENT: 'POW_COMMENT',
  NOTE_CREATED: 'NOTE_CREATED',
  COMMENT_REPLY: 'COMMENT_REPLY',
  COMMENT_LIKE: 'COMMENT_LIKE',
  COMMENT_MENTIONED_YOU: 'COMMENT_MENTIONED_YOU',
  [EventType.COMMENT_PINNED]: EventType.COMMENT_PINNED,
  [EventType.LISTING_WINNERS_ANNOUNCED]: EventType.LISTING_WINNERS_ANNOUNCED,
  WINNER_NOTIFICATION: 'WINNER_NOTIFICATION',
  [EventType.LISTING_EDITED]: EventType.LISTING_EDITED,
  DEADLINE_IN_3_DAYS: 'DEADLINE_IN_3_DAYS',
  [EventType.SUBMISSION_APPROVED]: EventType.SUBMISSION_APPROVED,
  [EventType.SUBMISSION_PAID]: EventType.SUBMISSION_PAID,
  [EventType.SUBMISSION_REJECTED]: EventType.SUBMISSION_REJECTED,
  TREASURY_PROPOSAL_STATUS_CHANGED: 'TREASURY_PROPOSAL_STATUS_CHANGED',
  [EventType.SPONSOR_MEMBER_INVITED]: EventType.SPONSOR_MEMBER_INVITED,
  [EventType.SPONSOR_MEMBER_ACCEPTED]: EventType.SPONSOR_MEMBER_ACCEPTED,
  [EventType.SCOUT_INVITE]: EventType.SCOUT_INVITE,
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
