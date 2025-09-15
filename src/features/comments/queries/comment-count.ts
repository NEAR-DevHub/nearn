import { type CommentType } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export const commentCountQuery = (
  submissionId: string | undefined,
  type?: CommentType,
) => ({
  queryKey: ['comment-count', submissionId, type],
  queryFn: async () => {
    if (!submissionId) {
      return { count: 0 };
    }

    const response = await api.get(`/api/comment/${submissionId}`, {
      params: {
        skip: 0,
        take: 1,
        type: type,
      },
    });

    return response.data;
  },
  enabled: !!submissionId,
});

export const useCommentCount = (
  submissionId: string | undefined,
  type?: CommentType,
) => {
  return useQuery(commentCountQuery(submissionId, type));
};
