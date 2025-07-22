import type { CompensationType, Role, SubmissionLabels } from '@prisma/client';
import { type JsonValue, type Record } from '@prisma/client/runtime/library';

export enum EventType {
  SPONSOR_TREASURY_ADDED = 'SPONSOR_TREASURY_ADDED',
  SPONSOR_TREASURY_REMOVED = 'SPONSOR_TREASURY_REMOVED',
  SPONSOR_MEMBER_INVITED = 'SPONSOR_MEMBER_INVITED',
  SPONSOR_MEMBER_REMOVED = 'SPONSOR_MEMBER_REMOVED',
  SPONSOR_MEMBER_INVITE_REMOVED = 'SPONSOR_MEMBER_INVITE_REMOVED',
  SPONSOR_MEMBER_ACCEPTED = 'SPONSOR_MEMBER_ACCEPTED',
  SPONSOR_PROFILE_EDITED = 'SPONSOR_PROFILE_EDITED',
  LISTING_CREATED = 'LISTING_CREATED',
  LISTING_PUBLISHED = 'LISTING_PUBLISHED',
  LISTING_EDITED = 'LISTING_EDITED',
  LISTING_COMPLETED = 'LISTING_COMPLETED',
  LISTING_UNPUBLISHED = 'LISTING_UNPUBLISHED',
  LISTING_WINNERS_ANNOUNCED = 'LISTING_WINNERS_ANNOUNCED',
  SUBMISSION_CREATED = 'SUBMISSION_CREATED',
  SUBMISSION_EDITED = 'SUBMISSION_EDITED',
  SUBMISSION_NOTE_CHANGED = 'SUBMISSION_NOTE_CHANGED',
  SUBMISSION_LABEL_CHANGED = 'SUBMISSION_LABEL_CHANGED',
  // This is an intermediate state for bounties
  SUBMISSION_TOGGLED_WINNER = 'SUBMISSION_TOGGLED_WINNER',
  // This is a winner state for bounties
  SUBMISSION_APPROVED = 'SUBMISSION_APPROVED',
  SUBMISSION_REJECTED = 'SUBMISSION_REJECTED',
  SUBMISSION_TREASURY_CREATED = 'SUBMISSION_TREASURY_CREATED',
  SUBMISSION_PAYMENT_DATE_EDITED = 'SUBMISSION_PAYMENT_DATE_EDITED',
  SUBMISSION_PAID = 'SUBMISSION_PAID',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  TREASURY_PROPOSAL_APPROVED = 'TREASURY_PROPOSAL_APPROVED',
  TREASURY_PROPOSAL_REJECTED = 'TREASURY_PROPOSAL_REJECTED',
  TREASURY_PROPOSAL_EXPIRED = 'TREASURY_PROPOSAL_EXPIRED',
  SYSTEM_STATUS_CHANGED = 'SYSTEM_STATUS_CHANGED',
}

/**
 * Fields that can be edited in a sponsor profile
 */
export type SponsorEditableFields =
  | 'name'
  | 'slug'
  | 'bio'
  | 'logo'
  | 'banner'
  | 'industry'
  | 'website'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'telegram'
  | 'discord'
  | 'entityName'
  | 'about';

/**
 * Type mapping for sponsor field values
 */
export interface SponsorFieldValueMap {
  name: string | null;
  slug: string | null;
  bio: string | null;
  logo: string | null;
  banner: string | null;
  industry: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
  telegram: string | null;
  discord: string | null;
  entityName: string | null;
  about: string | null;
}

/**
 * Fields that can be edited in a listing
 */
export type ListingEditableFields =
  | 'title'
  | 'description'
  | 'pocSocials'
  | 'deadline'
  | 'skills'
  | 'eligibility'
  | 'region'
  | 'isPrivate'
  | 'token'
  | 'compensationType'
  | 'rewards'
  | 'maxBonusSpots'
  | 'minRewardAsk'
  | 'maxRewardAsk';

/**
 * Type mapping for listing field values
 */
export interface ListingFieldValueMap {
  title: string;
  description: string | null;
  pocSocials: string | null;
  deadline: Date | null;
  skills: JsonValue | null;
  eligibility: JsonValue | null;
  region: string | null;
  isPrivate: boolean;
  token: string | null;
  compensationType: CompensationType;
  rewards: JsonValue | null;
  maxBonusSpots: number | null;
  minRewardAsk: number | null;
  maxRewardAsk: number | null;
}

/**
 * Fields that can be edited in a submission
 */
export type SubmissionEditableFields =
  | 'link'
  | 'tweet'
  | 'otherInfo'
  | 'eligibilityAnswers'
  | 'ask'
  | 'token'
  | 'otherTokenDetails';

/**
 * Type mapping for submission field values
 */
export interface SubmissionFieldValueMap {
  link: string | null;
  tweet: string | null;
  otherInfo: string | null;
  eligibilityAnswers: JsonValue | null;
  ask: number | null;
  token: string | null;
  otherTokenDetails: string | null;
}

/**
 * Type-safe event data mapping for all event types.
 * Each event type has a specific data structure that must be provided when logging.
 */
export interface EventDataMap {
  // Sponsor Events
  [EventType.SPONSOR_TREASURY_ADDED]: {
    dao?: string;
    url?: string;
  };

  [EventType.SPONSOR_TREASURY_REMOVED]: {
    old_dao?: string;
    old_url?: string;
  };

  [EventType.SPONSOR_MEMBER_INVITED]: {
    invitedEmail: string;
    invitedUserId?: string;
    role: Role;
  };

  [EventType.SPONSOR_MEMBER_REMOVED]: {
    removedUserId: string;
    previousRole: Role;
  };

  [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: {
    invitedEmail: string;
    invitedUserId?: string;
    role: Role;
  };

  [EventType.SPONSOR_MEMBER_ACCEPTED]: {
    role: Role;
  };

  [EventType.SPONSOR_PROFILE_EDITED]: {
    changes: Array<{
      field: SponsorEditableFields;
      oldValue: SponsorFieldValueMap[SponsorEditableFields] | null;
      newValue: SponsorFieldValueMap[SponsorEditableFields] | null;
    }>;
  };

  // Listing Events
  [EventType.LISTING_CREATED]: Record<string, never>;
  [EventType.LISTING_PUBLISHED]: Record<string, never>;

  [EventType.LISTING_EDITED]: {
    changes: Array<{
      field: ListingEditableFields;
      oldValue: ListingFieldValueMap[ListingEditableFields] | null;
      newValue: ListingFieldValueMap[ListingEditableFields] | null;
    }>;
  };

  [EventType.LISTING_COMPLETED]: Record<string, never>; // TODO: except for sponsorship manual
  [EventType.LISTING_UNPUBLISHED]: Record<string, never>;
  [EventType.LISTING_WINNERS_ANNOUNCED]: {
    winners: Array<{
      submissionId: string;
      position: number;
    }>;
  };

  // Submission Events
  [EventType.SUBMISSION_CREATED]: Record<string, never>;

  [EventType.SUBMISSION_EDITED]: {
    changes: Array<{
      field: SubmissionEditableFields;
      oldValue: SubmissionFieldValueMap[SubmissionEditableFields] | null;
      newValue: SubmissionFieldValueMap[SubmissionEditableFields] | null;
    }>;
  };

  [EventType.SUBMISSION_NOTE_CHANGED]: {
    before?: string;
    after?: string;
  };

  [EventType.SUBMISSION_LABEL_CHANGED]: {
    before: SubmissionLabels;
    after: SubmissionLabels;
  };

  [EventType.SUBMISSION_TOGGLED_WINNER]: {
    winnerPosition?: number;
  };

  [EventType.SUBMISSION_APPROVED]: {
    position: number;
  };

  [EventType.SUBMISSION_REJECTED]: Record<string, never>;

  [EventType.SUBMISSION_TREASURY_CREATED]: {
    proposalLink: string;
  };

  [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: {
    before: Date | null;
    after: Date;
  };

  [EventType.SUBMISSION_PAID]: {
    link: string;
  };

  // Comment Events
  [EventType.COMMENT_ADDED]: {
    commentId: string;
    repliedTo?: string;
  };

  [EventType.COMMENT_DELETED]: {
    commentId: string;
  };

  // Treasury Events
  [EventType.TREASURY_PROPOSAL_APPROVED]: {
    proposalLink: string;
  };

  [EventType.TREASURY_PROPOSAL_REJECTED]: {
    // TODO:
    proposalLink: string;
  };

  [EventType.TREASURY_PROPOSAL_EXPIRED]: {
    // TODO:
    proposalLink: string;
  };

  // System Events
  [EventType.SYSTEM_STATUS_CHANGED]: {
    // TODO:
    oldStatus: string;
    newStatus: string;
  };
}

/**
 * Helper type to get the data type for a specific event
 */
export type EventData<T extends EventType> = EventDataMap[T];

/**
 * Helper type for creating event log entries
 */
export interface CreateEventLogParams<T extends EventType> {
  eventType: T;
  actorId: string;
  actorType: 'SPONSOR' | 'TALENT' | 'PLATFORM_ADMIN' | 'SYSTEM';
  data: EventData<T>;
  visibility?: 'PUBLIC' | 'TALENT' | 'SPONSOR' | 'PLATFORM_ADMIN';
  entities?: {
    listingId?: string;
    submissionId?: string;
    sponsorId?: string;
    commentId?: string;
  };
}

/**
 * Helper to detect changes between old and new sponsor data
 */
export function detectSponsorChanges(
  oldData: Partial<SponsorFieldValueMap>,
  newData: Partial<SponsorFieldValueMap>,
): Array<{
  field: SponsorEditableFields;
  oldValue: SponsorFieldValueMap[SponsorEditableFields] | null;
  newValue: SponsorFieldValueMap[SponsorEditableFields] | null;
}> {
  const changes: Array<{
    field: SponsorEditableFields;
    oldValue: SponsorFieldValueMap[SponsorEditableFields] | null;
    newValue: SponsorFieldValueMap[SponsorEditableFields] | null;
  }> = [];

  const fields: SponsorEditableFields[] = [
    'name',
    'slug',
    'bio',
    'logo',
    'banner',
    'industry',
    'website',
    'twitter',
    'linkedin',
    'github',
    'telegram',
    'discord',
    'entityName',
    'about',
  ];

  for (const field of fields) {
    const oldVal = oldData[field] ?? null;
    const newVal = newData[field] ?? null;

    if (oldVal !== newVal) {
      changes.push({
        field,
        oldValue: oldVal as SponsorFieldValueMap[SponsorEditableFields] | null,
        newValue: newVal as SponsorFieldValueMap[SponsorEditableFields] | null,
      });
    }
  }

  return changes;
}

/**
 * Helper to detect changes between old and new listing data
 */
export function detectListingChanges(
  oldData: Partial<ListingFieldValueMap>,
  newData: Partial<ListingFieldValueMap>,
): Array<{
  field: ListingEditableFields;
  oldValue: ListingFieldValueMap[ListingEditableFields] | null;
  newValue: ListingFieldValueMap[ListingEditableFields] | null;
}> {
  const changes: Array<{
    field: ListingEditableFields;
    oldValue: ListingFieldValueMap[ListingEditableFields] | null;
    newValue: ListingFieldValueMap[ListingEditableFields] | null;
  }> = [];

  const fields: ListingEditableFields[] = [
    'title',
    'description',
    'pocSocials',
    'deadline',
    'skills',
    'eligibility',
    'region',
    'isPrivate',
    'token',
    'compensationType',
    'rewards',
    'maxBonusSpots',
    'minRewardAsk',
    'maxRewardAsk',
  ];

  for (const field of fields) {
    const oldVal = oldData[field] ?? null;
    const newVal = newData[field] ?? null;

    // Special handling for complex types
    if (field === 'skills' || field === 'eligibility' || field === 'rewards') {
      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (oldStr !== newStr) {
        changes.push({
          field,
          oldValue: oldVal as
            | ListingFieldValueMap[ListingEditableFields]
            | null,
          newValue: newVal as
            | ListingFieldValueMap[ListingEditableFields]
            | null,
        });
      }
    } else if (oldVal !== newVal) {
      changes.push({
        field,
        oldValue: oldVal as ListingFieldValueMap[ListingEditableFields] | null,
        newValue: newVal as ListingFieldValueMap[ListingEditableFields] | null,
      });
    }
  }

  return changes;
}

/**
 * Helper to detect changes between old and new submission data
 */
export function detectSubmissionChanges(
  oldData: Partial<SubmissionFieldValueMap>,
  newData: Partial<SubmissionFieldValueMap>,
): Array<{
  field: SubmissionEditableFields;
  oldValue: SubmissionFieldValueMap[SubmissionEditableFields] | null;
  newValue: SubmissionFieldValueMap[SubmissionEditableFields] | null;
}> {
  const changes: Array<{
    field: SubmissionEditableFields;
    oldValue: SubmissionFieldValueMap[SubmissionEditableFields] | null;
    newValue: SubmissionFieldValueMap[SubmissionEditableFields] | null;
  }> = [];

  const fields: SubmissionEditableFields[] = [
    'link',
    'tweet',
    'otherInfo',
    'eligibilityAnswers',
    'ask',
    'token',
    'otherTokenDetails',
  ];

  for (const field of fields) {
    const oldVal = oldData[field] ?? null;
    const newVal = newData[field] ?? null;

    // Special handling for eligibilityAnswers array
    if (field === 'eligibilityAnswers') {
      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (oldStr !== newStr) {
        changes.push({
          field,
          oldValue: oldVal as
            | SubmissionFieldValueMap[SubmissionEditableFields]
            | null,
          newValue: newVal as
            | SubmissionFieldValueMap[SubmissionEditableFields]
            | null,
        });
      }
    } else if (oldVal !== newVal) {
      changes.push({
        field,
        oldValue: oldVal as
          | SubmissionFieldValueMap[SubmissionEditableFields]
          | null,
        newValue: newVal as
          | SubmissionFieldValueMap[SubmissionEditableFields]
          | null,
      });
    }
  }

  return changes;
}
