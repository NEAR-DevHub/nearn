import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { type MilestoneWithUser } from '@/interface/submission';
import { api } from '@/lib/api';

interface CreateMilestonesPayload {
  submissionId: string;
  useSingleMilestone: boolean;
  milestones?: Array<{
    title: string;
    description?: string;
    deadline?: string;
    reward: number;
  }>;
}

interface CreateMilestonesResponse {
  milestones: MilestoneWithUser[];
}

export const useCreateMilestones = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateMilestonesResponse, Error, CreateMilestonesPayload>({
    mutationFn: async (body) => {
      const response = await api.post('/api/milestones/create', body);
      if (!response.data) throw new Error('Failed to create milestones');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment setup completed successfully');

      queryClient.invalidateQueries({ queryKey: ['sponsor-submissions'] });
    },
    onError: (error: any) => {
      console.error('Failed to create milestones:', error);
      const errorMessage =
        error?.response?.data?.error || 'Failed to save milestones';
      toast.error(errorMessage);
    },
  });
};
