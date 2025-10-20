import { useMemo } from 'react';

import { type Listing } from '@/features/listings/types';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

import MilestonePaymentCard from './MilestonePaymentCard';

interface Props {
  listing: Listing;
  submissions: SubmissionWithListingUser[];
  sequentialId: number;
}

export default function MilestonePaymentsTable({
  listing,
  submissions,
  sequentialId,
}: Props) {
  const multiMilestoneSubmissions = useMemo(
    () => submissions.filter((submission) => submission.Milestones.length > 1),
    [submissions],
  );
  return (
    <div className="flex h-full flex-col gap-3">
      {multiMilestoneSubmissions.map((submission) => (
        <MilestonePaymentCard
          key={submission.sequentialId}
          submission={submission}
          bounty={listing}
          singleSubmission={multiMilestoneSubmissions.length === 1}
          isExpanded={sequentialId === submission.sequentialId}
        />
      ))}
    </div>
  );
}
