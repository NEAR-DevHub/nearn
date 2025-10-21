import {
  type Milestone,
  type SubmissionLabels,
  type SubmissionStatus,
} from '@prisma/client';

import type { Listing, Rewards } from '@/features/listings/types';

import { type User } from './user';

interface MilestoneWithUser extends Omit<Milestone, 'paymentDetails'> {
  milestoneIndex: number;
  paidByUser?: User;
  approvedByUser?: User;
  paymentDetails?: {
    txId?: string;
    link?: string;
    treasury?: {
      link?: string;
      proposalId?: number;
      dao?: string;
      synced?: boolean;
    };
    manual?: {
      amount: number;
      token: string;
      fiatCurrency?: string;
      paymentDate: string;
      notes?: string;
      isPublic?: boolean;
    };
  };
}

interface SubmissionWithUser {
  id: string;
  sequentialId: number;
  status: SubmissionStatus | 'Deleted';
  link?: string;
  tweet?: string;
  otherInfo?: string;
  otherTokenDetails?: string;
  eligibilityAnswers?: any;
  userId: string;
  listingId: string;
  isWinner: boolean;
  winnerPosition?: keyof Rewards;
  approveDate?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  like?: any;
  user: User;
  listing?: Listing;
  ask?: number;
  label: SubmissionLabels;
  totalEarnings?: number;
  token?: string;
  approvedBy?: string;
  Milestones: MilestoneWithUser[];
}

export type { MilestoneWithUser, SubmissionWithUser };
