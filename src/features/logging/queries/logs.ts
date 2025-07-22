import { type EventLog } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

interface GetLogsParams {
  refType: 'submission' | 'listing' | 'sponsor';
  refId: string;
}

const fetchLogs = async (params: GetLogsParams): Promise<EventLog[]> => {
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
