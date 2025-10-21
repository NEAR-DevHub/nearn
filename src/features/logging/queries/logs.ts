import {
  ActorType,
  type CommentRefType,
  type EventLog,
  type EventVisibility,
  type Prisma,
} from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';

import { PROJECT_NAME } from '@/constants/project';
import { api } from '@/lib/api';

import { EventType, isRoleAtLeast } from '@/features/logging/types/event-data';

interface GetLogsParams {
  refType: 'submission' | 'listing' | 'sponsor' | 'milestone';
  refId?: string;
  eventTypes?: EventType[];
  searchText?: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  maxVisibility?: EventVisibility;
  startDate?: Date;
  endDate?: Date;
}

interface PaginatedLogsResponse {
  logs: Log[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export function eventFilters(
  category:
    | 'listing'
    | 'submission'
    | 'team'
    | 'profile'
    | 'payments'
    | 'comments',
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
      EventType.SYSTEM_STATUS_IN_REVIEW,
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
      EventType.SUBMISSION_CANCELLED,
      EventType.SUBMISSION_MANUAL_PAYMENT_ADDED,
      EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED,
      EventType.TREASURY_PROPOSAL_APPROVED,
      EventType.TREASURY_PROPOSAL_REJECTED,
      EventType.TREASURY_PROPOSAL_EXPIRED,
      EventType.MILESTONE_CREATED,
      EventType.MILESTONE_STATUS_UPDATED,
      EventType.MILESTONE_APPROVED,
      EventType.MILESTONES_EDITED,
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
      EventType.SUBMISSION_MANUAL_PAYMENT_ADDED,
      EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED,
      EventType.TREASURY_PROPOSAL_APPROVED,
      EventType.TREASURY_PROPOSAL_REJECTED,
      EventType.TREASURY_PROPOSAL_EXPIRED,
      EventType.SUBMISSION_PAYMENT_DATE_EDITED,
      EventType.SUBMISSION_TREASURY_CREATED,
      EventType.SUBMISSION_CANCELLED,
      EventType.MILESTONE_APPROVED,
    ],
    comments: [
      EventType.COMMENT_ADDED,
      EventType.COMMENT_DELETED,
      EventType.COMMENT_PINNED,
      EventType.COMMENT_UNPINNED,
    ],
    milestones: [
      EventType.MILESTONE_CREATED,
      EventType.MILESTONE_STATUS_UPDATED,
      EventType.MILESTONE_APPROVED,
      EventType.MILESTONES_EDITED,
      EventType.SUBMISSION_PAID,
      EventType.TREASURY_PROPOSAL_APPROVED,
      EventType.TREASURY_PROPOSAL_REJECTED,
      EventType.TREASURY_PROPOSAL_EXPIRED,
    ],
  };

  return mapping[category];
}

export const prismaLogInclude: Prisma.EventLogInclude = {
  submission: {
    select: {
      sequentialId: true,
      userId: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  },
  listing: {
    select: {
      id: true,
      sequentialId: true,
      slug: true,
      type: true,
      title: true,
      pocId: true,
      poc: {
        select: {
          username: true,
        },
      },
    },
  },
  sponsor: {
    select: {
      name: true,
      slug: true,
      logo: true,
    },
  },
  actor: {
    select: {
      username: true,
      name: true,
      photo: true,
      private: true,
    },
  },
  comment: {
    select: {
      id: true,
      author: {
        select: {
          username: true,
          name: true,
          photo: true,
          private: true,
        },
      },
      refType: true,
      message: true,
      repliedTo: {
        select: {
          id: true,
          authorId: true,
          author: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  },
  milestone: {
    select: {
      id: true,
      milestoneIndex: true,
      title: true,
      description: true,
      deadline: true,
      reward: true,
      token: true,
      status: true,
    },
  },
  pow: {
    select: {
      id: true,
      userId: true,
    },
  },
};

export type Log = EventLog & {
  actor?: {
    username: string;
    name?: string;
    photo: string;
    private: boolean;
  };
  submission?: {
    sequentialId: number;
    userId: string;
    user: {
      username: string;
    };
  };
  listing?: {
    id: string;
    sequentialId: number;
    type: 'bounty' | 'sponsorship' | 'project' | 'hackathon';
    title: string;
    slug: string;
    pocId: string;
    poc: {
      username: string;
    };
  };
  comment?: {
    id: string;
    author: {
      username: string;
      private: boolean;
      name?: string;
      photo: string;
    };
    message: string;
    refType: CommentRefType;
    repliedTo?: {
      id: string;
      authorId: string;
      author: {
        username: string;
      };
    };
  };
  sponsor?: {
    name: string;
    slug: string;
    logo: string;
  };
  milestone?: {
    id: string;
    milestoneIndex: number;
    title: string;
    description: string | null;
    deadline: Date | null;
    reward: number;
    token: string;
    status: string;
  };
  pow?: {
    id: string;
    userId: string;
  };
};

const fetchLogs = async (
  params: GetLogsParams,
): Promise<PaginatedLogsResponse> => {
  const searchText = (params.searchText ?? '').trim();
  const { data } = await api.get('/api/logging/get', {
    params: {
      ...params,
      searchText: searchText.length > 0 ? searchText : undefined,
      page: params.page || 1,
      limit: params.limit || 50,
      startDate: params.startDate?.toISOString(),
      endDate: params.endDate?.toISOString(),
    },
  });
  return data;
};

export const useGetLogsInfinite = (params: Omit<GetLogsParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['logs-infinite', params],
    queryFn: ({ pageParam = 1 }) => fetchLogs({ ...params, page: pageParam }),
    enabled: !!params.refId,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

export const prepareLogData = (log: Log, visibility: EventVisibility) => {
  const isAtLeastSponsor = isRoleAtLeast(visibility, 'SPONSOR');
  const isAtLeastPlatformAdmin = isRoleAtLeast(visibility, 'PLATFORM_ADMIN');
  const actorHidden =
    (log.actorType === ActorType.SPONSOR && !isAtLeastSponsor) ||
    (log.actorType === ActorType.PLATFORM_ADMIN && !isAtLeastPlatformAdmin);

  return {
    ...log,
    actor:
      log.actor && !actorHidden
        ? {
            ...log.actor,
            name: log.actor.private ? undefined : log.actor.name,
            private: undefined,
          }
        : undefined,
    submissionId: !isAtLeastSponsor ? undefined : log.submissionId,
    // We don't want to expose who behind the scenes for sponsors and platform admins
    actorId: actorHidden ? undefined : log.actorId,
    comment: log.comment
      ? {
          ...log.comment,
          author: {
            ...log.comment.author,
            name: log.comment.author?.private
              ? undefined
              : log.comment.author?.name ||
                log.comment.author?.username ||
                PROJECT_NAME,
            private: undefined,
          },
        }
      : undefined,
  };
};
