import { type Dispatch, type SetStateAction } from 'react';

import { type Listing } from '../../listings/types';
import { type SubmissionWithListingUser } from '../queries/dashboard-submissions';
import { PublishProjectHiring } from './PublishProjectHiring';
import { PublishResults } from './PublishResults';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  totalWinners: number;
  totalPaymentsMade: number;
  bounty: Listing | undefined;
  remainings: { podiums: number; bonus: number } | null;
  submissions: SubmissionWithListingUser[];
  usedPositions: number[];
  setRemainings: Dispatch<
    SetStateAction<{ podiums: number; bonus: number } | null>
  >;
}

export function PublishModal(props: Props) {
  const { bounty } = props;

  // TODO: Separate into three different components based on listing type:
  // 1. PublishBountyResults - for bounty type listings (current PublishResults functionality)
  // 2. PublishProjectHiring - for project type listings (new hiring flow)
  // 3. PublishSponsorshipApproval - for sponsorship type listings (sponsorship approval flow)

  // Orchestrator logic - route to appropriate component based on listing type
  if (bounty?.type === 'project') {
    return <PublishProjectHiring {...props} />;
  }

  if (bounty?.type === 'sponsorship') {
    // TODO: Implement PublishSponsorshipApproval component
    // For now, using existing PublishResults component
    return <PublishResults {...props} />;
  }

  // Default to bounty results (for 'bounty' type or undefined)
  return <PublishResults {...props} />;
}
