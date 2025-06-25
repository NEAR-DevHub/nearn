import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api';

interface UserQueryParams {
  userId: string;
}

const fetchUserQueryFn = async ({ userId }: UserQueryParams) => {
  const response = await api.get(`/api/sponsor-dashboard/user/${userId}`);
  return response.data;
};

export const getUserQuery = ({ userId }: UserQueryParams) =>
  queryOptions({
    queryKey: ['user', userId],
    queryFn: () => fetchUserQueryFn({ userId }),
    enabled: !!userId,
  });
