import { type EventLog } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

interface GetLogsParams {
  refType: 'submission' | 'listing' | 'sponsor';
  refId: string;
}

export type Log = EventLog & {
  User?: {
    username: string;
    name?: string;
    photo: string;
  };
  submission?: {
    sequentialId: number;
    user: {
      username: string;
    };
  };
  listing?: {
    sequentialId: number;
  };
  sponsor?: {
    name: string;
    slug: string;
    logo: string;
  };
};

const fetchLogs = async (params: GetLogsParams): Promise<Log[]> => {
  const { data } = await api.get('/api/logging/get', {
    params,
  });
  return data;
};

export const useGetLogs = (params: GetLogsParams) => {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => fetchLogs(params),
    enabled: !!params.refId,
  });
};
