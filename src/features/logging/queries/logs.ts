import { type EventLog } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

import { EventType } from '@/features/logging/types/event-data';

interface GetLogsParams {
  refType: 'submission' | 'listing' | 'sponsor';
  refId: string;
  eventTypes?: EventType[];
  searchText?: string;
}

export function eventFilters(
  category: 'listing' | 'submission' | 'team' | 'profile' | 'payments',
): EventType[] {
  const mapping = {
    listing: [
      EventType.LISTING_CREATED,
      EventType.LISTING_PUBLISHED,
      EventType.LISTING_EDITED,
      EventType.LISTING_COMPLETED,
      EventType.LISTING_UNPUBLISHED,
      EventType.LISTING_WINNERS_ANNOUNCED,
      EventType.SYSTEM_STATUS_CHANGED,
    ],
    submission: [
      EventType.SUBMISSION_CREATED,
      EventType.SUBMISSION_EDITED,
      EventType.SUBMISSION_APPROVED,
      EventType.SUBMISSION_REJECTED,
      EventType.SUBMISSION_NOTE_CHANGED,
      EventType.SUBMISSION_LABEL_CHANGED,
      EventType.SUBMISSION_TOGGLED_WINNER,
      EventType.SUBMISSION_TREASURY_CREATED,
      EventType.SUBMISSION_PAYMENT_DATE_EDITED,
      EventType.SUBMISSION_PAID,
      EventType.TREASURY_PROPOSAL_APPROVED,
      EventType.TREASURY_PROPOSAL_REJECTED,
      EventType.TREASURY_PROPOSAL_EXPIRED,
    ],
    team: [
      EventType.SPONSOR_MEMBER_INVITED,
      EventType.SPONSOR_MEMBER_REMOVED,
      EventType.SPONSOR_MEMBER_INVITE_REMOVED,
      EventType.SPONSOR_MEMBER_ACCEPTED,
    ],
    profile: [
      EventType.SPONSOR_TREASURY_ADDED,
      EventType.SPONSOR_TREASURY_REMOVED,
      EventType.SPONSOR_PROFILE_EDITED,
    ],
    payments: [
      EventType.SUBMISSION_PAID,
      EventType.TREASURY_PROPOSAL_APPROVED,
      EventType.TREASURY_PROPOSAL_REJECTED,
      EventType.TREASURY_PROPOSAL_EXPIRED,
      EventType.SUBMISSION_PAYMENT_DATE_EDITED,
      EventType.SUBMISSION_TREASURY_CREATED,
    ],
  };

  return mapping[category];
}

export type Log = EventLog & {
  User?: {
    username: string;
    name?: string;
    photo: string;
  };
  submission?: {
    sequentialId: number;
    user: {
      username: string;
    };
  };
  listing?: {
    sequentialId: number;
    type: 'bounty' | 'sponsorship' | 'project' | 'hackathon';
    title: string;
  };
  sponsor?: {
    name: string;
    slug: string;
    logo: string;
  };
};

const fetchLogs = async (params: GetLogsParams): Promise<Log[]> => {
  const searchText = (params.searchText ?? '').trim();
  const { data } = await api.get('/api/logging/get', {
    params: {
      ...params,
      searchText: searchText.length > 0 ? searchText : undefined,
    },
  });
  return data;
};

export const useGetLogs = (params: GetLogsParams) => {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => fetchLogs(params),
    enabled: !!params.refId,
  });
};
