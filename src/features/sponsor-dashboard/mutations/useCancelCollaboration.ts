import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export interface CancelCollaborationPayload {
  submissionId: string;
  reason?: string;
}

export const useCancelCollaboration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CancelCollaborationPayload) => {
      const response = await axios.post('/api/milestones/cancel', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Collaboration cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['sponsor-submissions'] });
      queryClient.invalidateQueries({
        queryKey: ['sponsor-dashboard-listing'],
      });
      queryClient.invalidateQueries({ queryKey: ['listing-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['logs-infinite'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || 'Failed to cancel collaboration';
      toast.error(errorMessage);
      console.error('Error cancelling collaboration:', error);
    },
  });
};
