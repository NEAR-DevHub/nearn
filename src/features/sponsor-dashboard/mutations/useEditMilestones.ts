import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export interface MilestoneEditData {
  title: string;
  description?: string;
  deadline?: string;
  reward: number;
}

export interface EditMilestonesPayload {
  submissionId: string;
  milestones: MilestoneEditData[];
}

export const useEditMilestones = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditMilestonesPayload) => {
      const response = await axios.post('/api/milestones/edit', payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Milestones updated successfully');
      queryClient.invalidateQueries({ queryKey: ['sponsor-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['logs-infinite'] });
      queryClient.invalidateQueries({
        queryKey: ['sponsor-dashboard-listing'],
      });
      return data.milestones;
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || 'Failed to update milestones';
      const details = error.response?.data?.details;

      if (details) {
        toast.error(`${errorMessage}: ${JSON.stringify(details)}`);
      } else {
        toast.error(errorMessage);
      }

      console.error('Error editing milestones:', error);
    },
  });
};
