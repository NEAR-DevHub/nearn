import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export const commentCountQuery = (submissionId: string | undefined) => ({
  queryKey: ['comment-count', submissionId],
  queryFn: async () => {
    if (!submissionId) {
      return { count: 0 };
    }

    const response = await api.get(`/api/comment/${submissionId}`, {
      params: {
        skip: 0,
        take: 1,
      },
    });

    return response.data;
  },
  enabled: !!submissionId,
});

export const useCommentCount = (submissionId: string | undefined) => {
  return useQuery(commentCountQuery(submissionId));
};
