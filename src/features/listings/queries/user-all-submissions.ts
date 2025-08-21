import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { SubmissionWithUser } from '@/interface/submission';

const fetchUserAllSubmissions = async (listingId: string): Promise<SubmissionWithUser[]> => {
  const { data } = await api.get('/api/submission/user-listing-submissions/', {
    params: { listingId },
  });
  return data;
};

export const userAllSubmissionsQuery = (
  listingId: string,
  userId: string | undefined,
) =>
  queryOptions({
    queryKey: ['userAllSubmissions', listingId],
    queryFn: () => fetchUserAllSubmissions(listingId),
    enabled: !!userId && !!listingId,
  });
