import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export const useApproveMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const response = await axios.post('/api/milestones/approve', {
        milestoneId,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Milestone approved successfully');
      queryClient.invalidateQueries({ queryKey: ['sponsor-submissions'] });
      queryClient.invalidateQueries({
        queryKey: ['sponsor-dashboard-listing'],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || 'Failed to approve milestone';
      toast.error(errorMessage);
      console.error('Error approving milestone:', error);
    },
  });
};
