import {
  type EventDataMap,
  EventType,
} from '@/features/logging/types/event-data';

import { type Log } from '../../queries/logs';
import Comment, { CommentPinnedUnpinned } from './Comment';
import CreateListing from './ListingCreated';
import ListingEdit from './ListingEdit';
import MilestoneApproveReject from './MilestoneApproveReject';
import MilestoneCreated from './MilestoneCreated';
import MilestonesEdited from './MilestonesEdited';
import MilestoneStatusChanged from './MilestoneStatusChanged';
import Paid from './Paid';
import PaymentDateEdited from './PaymentDateEdited';
import PlatformAdminSubmissionStatusEdited from './PlatformAdminSubmissionStatusEdited';
import ArchivedOrUnarchived from './PlatformArchivedOrUnarchived';
import PublishListing from './Publish';
import SimpleLogMessage from './SimpleLogMessage';
import SponsorEdit from './SponsorEdit';
import SponsorMember from './SponsorMember';
import SponsorTreasury from './SponsorTreasury';
import SubmissionApproveReject from './SubmissionApproveReject';
import SubmissionCreated from './SubmissionCreated';
import SubmissionEdit from './SubmissionEdit';
import SubmissionLabelChange from './SubmissionLabelChange';
import SubmissionManualPaymentUpdated from './SubmissionManualPaymentUpdated';
import SubmissionNoteChanged from './SubmissionNoteChanged';
import SubmissionToggledWinner from './SubmissionToggledWinner';
import SystemStatusChanged from './SystemStatusChanged';
import TreasuryProposal from './TreasuryProposal';

export interface LogProperties {
  event: Log;
  onSubmissionClick?: (event: Log) => void;
  onListingClick?: (event: Log) => void;
  onMilestoneClick?: (event: Log) => void;
}

const LOG_IMPLEMENTATION_MAPPING: Record<
  EventType,
  ((props: LogProperties) => React.ReactNode) | null
> = {
  [EventType.SPONSOR_TREASURY_ADDED]: SponsorTreasury,
  [EventType.SPONSOR_TREASURY_REMOVED]: SponsorTreasury,
  [EventType.SPONSOR_MEMBER_INVITED]: SponsorMember,
  [EventType.SPONSOR_MEMBER_REMOVED]: SponsorMember,
  [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: SponsorMember,
  [EventType.SPONSOR_MEMBER_ACCEPTED]: SponsorMember,
  [EventType.SPONSOR_PROFILE_EDITED]: SponsorEdit,
  [EventType.LISTING_CREATED]: CreateListing,
  [EventType.LISTING_PUBLISHED]: PublishListing,
  [EventType.LISTING_EDITED]: ListingEdit,
  [EventType.LISTING_COMPLETED]: () =>
    SimpleLogMessage({ message: 'Marked listing as Completed' }),
  [EventType.LISTING_UNPUBLISHED]: () =>
    SimpleLogMessage({ message: 'Unpublished listing' }),
  // TODO: this component should have winners data (userIds, we need to display those usernames)
  [EventType.LISTING_WINNERS_ANNOUNCED]: () =>
    SimpleLogMessage({ message: 'Announced winners' }),
  [EventType.SUBMISSION_CREATED]: SubmissionCreated,
  [EventType.SUBMISSION_EDITED]: SubmissionEdit,
  [EventType.SUBMISSION_NOTE_CHANGED]: SubmissionNoteChanged,
  [EventType.SUBMISSION_LABEL_CHANGED]: SubmissionLabelChange,
  [EventType.SUBMISSION_TOGGLED_WINNER]: SubmissionToggledWinner,
  [EventType.SUBMISSION_APPROVED]: SubmissionApproveReject,
  [EventType.SUBMISSION_REJECTED]: SubmissionApproveReject,
  [EventType.SUBMISSION_TREASURY_CREATED]: TreasuryProposal,
  [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: PaymentDateEdited,
  [EventType.SUBMISSION_PAID]: Paid,
  [EventType.SUBMISSION_MANUAL_PAYMENT_ADDED]: () =>
    SimpleLogMessage({ message: 'Marked as paid manually' }),
  [EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED]: SubmissionManualPaymentUpdated,
  [EventType.COMMENT_ADDED]: Comment,
  [EventType.COMMENT_DELETED]: Comment,
  [EventType.COMMENT_PINNED]: CommentPinnedUnpinned,
  [EventType.COMMENT_UNPINNED]: CommentPinnedUnpinned,
  [EventType.TREASURY_PROPOSAL_APPROVED]: TreasuryProposal,
  [EventType.TREASURY_PROPOSAL_REJECTED]: TreasuryProposal,
  [EventType.TREASURY_PROPOSAL_EXPIRED]: TreasuryProposal,
  [EventType.SYSTEM_STATUS_IN_REVIEW]: SystemStatusChanged,
  [EventType.PLATFORM_ADMIN_ARCHIVED_OR_UNARCHIVED]: ArchivedOrUnarchived,
  [EventType.PLATFORM_ADMIN_SUBMISSION_STATUS_EDITED]:
    PlatformAdminSubmissionStatusEdited,
  [EventType.SYSTEM_STATUS_CHANGED]: SystemStatusChanged,
  // TODO: add scout invite component
  [EventType.SCOUT_INVITE]: null,
  [EventType.AUTOMATION_LOG]: (props: LogProperties) => {
    const data = props.event.data as EventDataMap[EventType.AUTOMATION_LOG];
    return SimpleLogMessage({ message: data.message });
  },
  [EventType.MILESTONE_CREATED]: MilestoneCreated,
  [EventType.MILESTONE_STATUS_UPDATED]: MilestoneStatusChanged,
  [EventType.MILESTONE_APPROVED]: MilestoneApproveReject,
  [EventType.MILESTONE_CANCELLED]: MilestoneApproveReject,
  [EventType.MILESTONES_EDITED]: MilestonesEdited,
};

export default LOG_IMPLEMENTATION_MAPPING;
