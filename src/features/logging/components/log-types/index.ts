import { type EventLog } from '@prisma/client';

import { EventType } from '@/features/logging/types/event-data';

import CreateListing from './ListingCreated';
import PublishListing from './Publish';
import SubmissionCreated from './SubmissionCreated';

export interface LogProperties {
  event: EventLog;
}

const LOG_IMPLEMENTATION_MAPPING: Record<
  EventType,
  ((props: LogProperties) => React.ReactNode) | null
> = {
  [EventType.SPONSOR_TREASURY_ADDED]: null,
  [EventType.SPONSOR_TREASURY_REMOVED]: null,
  [EventType.SPONSOR_MEMBER_INVITED]: null,
  [EventType.SPONSOR_MEMBER_REMOVED]: null,
  [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: null,
  [EventType.SPONSOR_MEMBER_ACCEPTED]: null,
  [EventType.SPONSOR_PROFILE_EDITED]: null,
  [EventType.LISTING_CREATED]: CreateListing,
  [EventType.LISTING_PUBLISHED]: PublishListing,
  [EventType.LISTING_EDITED]: null,
  [EventType.LISTING_COMPLETED]: null,
  [EventType.LISTING_UNPUBLISHED]: null,
  [EventType.LISTING_WINNERS_ANNOUNCED]: null,
  [EventType.SUBMISSION_CREATED]: SubmissionCreated,
  [EventType.SUBMISSION_EDITED]: null,
  [EventType.SUBMISSION_NOTE_CHANGED]: null,
  [EventType.SUBMISSION_LABEL_CHANGED]: null,
  [EventType.SUBMISSION_TOGGLED_WINNER]: null,
  [EventType.SUBMISSION_APPROVED]: null,
  [EventType.SUBMISSION_REJECTED]: null,
  [EventType.SUBMISSION_TREASURY_CREATED]: null,
  [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: null,
  [EventType.SUBMISSION_PAID]: null,
  [EventType.COMMENT_ADDED]: null,
  [EventType.COMMENT_DELETED]: null,
  [EventType.TREASURY_PROPOSAL_APPROVED]: null,
  [EventType.TREASURY_PROPOSAL_REJECTED]: null,
  [EventType.TREASURY_PROPOSAL_EXPIRED]: null,
  [EventType.SYSTEM_STATUS_CHANGED]: null,
};

export default LOG_IMPLEMENTATION_MAPPING;
