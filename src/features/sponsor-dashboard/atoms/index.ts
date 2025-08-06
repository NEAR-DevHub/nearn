import { atom } from 'jotai';

import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

export const selectedSubmissionAtom = atom<
  SubmissionWithListingUser | undefined
>(undefined);

export const selectedSubmissionIdsAtom = atom<Set<string>>(new Set<string>());
