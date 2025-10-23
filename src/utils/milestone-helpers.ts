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
      pending: milestones.filter((m) => m.status === 'InReview').length,
    },
  };
}

export function getNextMilestoneIndex(submission: SubmissionWithUser): number {
  const milestones = submission.Milestones || [];
  if (milestones.length === 0) return 0;

  const maxIndex = Math.max(...milestones.map((m) => m.milestoneIndex || 0));
  return maxIndex + 1;
}

export function createDefaultMilestone(
  submissionId: string,
  reward: number,
  token: string,
  index: number = 0,
) {
  return {
    submissionId,
    milestoneIndex: index,
    title: index === 0 ? 'Payment for submission' : `Milestone ${index + 1}`,
    description: 'Default milestone for submission payment',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    reward,
    token,
    status: 'Approved' as const,
  };
}

export function getUnpaidMilestones(
  submission: SubmissionWithUser,
): MilestoneWithUser[] {
  return (submission.Milestones || []).filter((m) => m.status !== 'Paid');
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
