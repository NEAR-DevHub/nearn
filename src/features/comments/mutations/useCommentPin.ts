import { type CommentType } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { toast } from 'sonner';

import { api } from '@/lib/api';

interface UseCommentPinParams {
  commentId: string;
  type: CommentType;
  action: 'pin' | 'unpin';
}

interface CommentPinResponse {
  message: string;
  pinnedAt: string | null;
}

export const useCommentPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, action }: UseCommentPinParams) => {
      const response = await api.post<CommentPinResponse>(
        `/api/comment/${commentId}/pin`,
        { action },
      );
      return response.data;
    },
    onSuccess: (_, { type, action, commentId }) => {
      toast.success(
        `${type === 'INTERNAL_SUBMISSION_NOTES' ? 'Note' : 'Comment'} ${action === 'pin' ? 'pinned' : 'unpinned'}`,
      );

      posthog.capture('comment_pin', {
        commentId,
        pinned: action === 'pin',
      });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error: any, { type, action }) => {
      console.error(error);
      const errorMessage =
        error?.response?.data?.error ||
        `Failed to ${action === 'pin' ? 'pinned' : 'unpinned'} ${type === 'INTERNAL_SUBMISSION_NOTES' ? 'note' : 'comment'}`;
      toast.error(errorMessage);
    },
  });
};
