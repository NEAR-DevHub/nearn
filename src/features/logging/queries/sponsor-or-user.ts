import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

interface GetSponsorOrUserParams {
  id?: string;
  type: 'sponsor' | 'user';
}

interface SponsorOrUserResponse {
  id: string;
  name: string;
  photo: string | null;
}

const fetchSponsorOrUser = async (
  params: GetSponsorOrUserParams,
): Promise<SponsorOrUserResponse> => {
  const { data } = await api.get('/api/logging/sponsor-or-user', {
    params,
  });
  return data;
};

export const useGetSponsorOrUser = (params: GetSponsorOrUserParams) => {
  return useQuery({
    queryKey: ['sponsor-or-user', params],
    queryFn: () => fetchSponsorOrUser(params),
    enabled: !!params.id,
  });
};
