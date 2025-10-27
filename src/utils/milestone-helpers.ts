import type {
  MilestoneWithUser,
  SubmissionWithUser,
} from '@/interface/submission';

import type { Listing } from '@/features/listings/types';

export function getSubmissionPaymentStatus(
  submission: SubmissionWithUser & { listing?: Listing },
) {
  const milestones = submission.Milestones || [];

  const allMilestonesPaid =
    milestones.length > 0 && milestones.every((m) => m.status === 'Paid');

  let totalReward = 0;
  if (
    submission.listing &&
    submission.winnerPosition &&
    submission.listing.rewards
  ) {
    totalReward = submission.listing.rewards[submission.winnerPosition] || 0;
  }

  const totalPaid = milestones
    .filter((m) => m.status === 'Paid')
    .reduce((sum, m) => sum + m.reward, 0);

  return {
    isPaid: allMilestonesPaid,
    isApproved: submission.status === 'Approved',
    hasMilestones: milestones.length > 0,
    totalPaid,
    totalReward,
    remainingReward: totalReward - totalPaid,
    lastPaymentDate: milestones
      .filter((m) => m.status === 'Paid' && m.paidDate)
      .map((m) => m.paidDate)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0],
    lastPaymentDetails: milestones.find((m) => m.status === 'Paid')
      ?.paymentDetails,
    lastPaymentBy: milestones.find((m) => m.status === 'Paid')?.paidBy,
    milestoneProgress: {
      total: milestones.length,
      paid: milestones.filter((m) => m.status === 'Paid').length,
      approved: milestones.filter((m) => m.status === 'Approved').length,
      pending: milestones.filter((m) => m.status === 'InProgress').length,
    },
  };
}

export function getNextPayableMilestone(
  submission: SubmissionWithUser,
): MilestoneWithUser | undefined {
  const milestones = submission.Milestones || [];
  // Return the first approved but unpaid milestone
  return milestones.length > 1
    ? milestones
        .sort((a, b) => a.milestoneIndex - b.milestoneIndex)
        .find((m) => m.status === 'Approved')
    : milestones[0];
}

export function getMilestoneStatus(milestone: MilestoneWithUser) {
  if (
    ['NotStarted', 'InProgress'].includes(milestone.status) &&
    milestone.deadline &&
    new Date(milestone.deadline) < new Date()
  ) {
    return 'Overdue';
  }
  return milestone.status;
}
