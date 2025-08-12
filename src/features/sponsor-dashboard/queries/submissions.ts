import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api';

import { type SubmissionWithListingUser } from './dashboard-submissions';

const fetchSubmissions = async (
  slug: string,
  isHackathon?: boolean,
): Promise<SubmissionWithListingUser[]> => {
  const { data } = await api.get(`/api/sponsor-dashboard/${slug}/submissions`, {
    params: { isHackathon },
  });
  return data;
};

export const submissionsQuery = (slug: string, isHackathon?: boolean) =>
  queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['sponsor-submissions', slug],
    queryFn: () => fetchSubmissions(slug, isHackathon),
    enabled: !!slug,
  });
