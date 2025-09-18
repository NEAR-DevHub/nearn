import {
  type CommentRefType,
  type CommentType,
  type Prisma,
} from '@prisma/client';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/lib/api';

import { type Rewards } from '@/features/listings/types';

import { type NotificationDataMap, type NotificationType } from '../types';

export interface Notification<T extends NotificationType> {
  id: string;
  receiverId: string;
  actorId: string | null;
  listingId: string | null;
  submissionId: string | null;
  commentId: string | null;
  powId: string | null;
  sponsorId: string | null;
  channel: string;
  type: T;
  data: NotificationDataMap[T];
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  actor?: {
    username: string;
    name?: string;
    photo: string;
    private: boolean;
  };
  submission?: {
    sequentialId: number;
    userId: string;
    token: string;
    winnerPosition: number;
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
    token: string;
    rewards: Rewards;
    pocId: string;
    isPublished: boolean;
    isPrivate: boolean;
    pocSocials: string;
    poc: {
      username: string;
    };
  };
  receiver: {
    name: string;
    username: string;
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
    type: CommentType;
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
  pow?: {
    id: string;
    userId: string;
    title: string;
  };
}

export const notificationInclude: Prisma.NotificationInclude = {
  submission: {
    select: {
      id: true,
      sequentialId: true,
      userId: true,
      token: true,
      winnerPosition: true,
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
      rewards: true,
      token: true,
      pocId: true,
      isPrivate: true,
      isPublished: true,
      pocSocials: true,
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
      type: true,
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
  receiver: {
    select: {
      name: true,
      username: true,
    },
  },
  pow: {
    select: {
      id: true,
      userId: true,
      title: true,
    },
  },
};

export interface NotificationsResponse {
  notifications: Notification<NotificationType>[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

interface UseNotificationsParams {
  limit?: number;
  read?: boolean;
  sponsorIds?: string[];
  showTalent?: boolean;
}

const fetchNotifications = async (
  params: UseNotificationsParams & { page: number },
): Promise<NotificationsResponse> => {
  const { data } = await api.get<NotificationsResponse>(
    '/api/notifications/get',
    {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        read: params.read,
        sponsorIds: params.sponsorIds,
        showSponsors: params.sponsorIds?.length === 0 ? 'false' : undefined,
        showTalent: params.showTalent,
      },
    },
  );
  return data;
};

export const useNotificationsInfinite = (
  params: UseNotificationsParams = {},
) => {
  return useInfiniteQuery({
    queryKey: ['notifications-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      fetchNotifications({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const { data } = await api.post('/api/notifications/mark-as-read', {
        notificationIds,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-infinite'] });
    },
  });
};
