import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/lib/api';

import { type Log } from '@/features/logging/queries/logs';

import { type NotificationType } from '../types';

export interface Notification {
  id: string;
  userId: string;
  eventId: string | null;
  channel: string;
  sponsorId: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: Log | null;
  type: NotificationType;
}

export interface NotificationsResponse {
  notifications: Notification[];
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
