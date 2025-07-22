'use client';

import { Loader2 } from 'lucide-react';

import { useGetLogs } from '../queries/logs';
import Log from './Log';

interface Properties {
  refType: 'submission' | 'listing' | 'sponsor';
  refId: string;
  sponsorGlobalView?: boolean;
}

export default function LogsTimeline({
  refType,
  refId,
  sponsorGlobalView = false,
}: Properties) {
  const { data: logs, isLoading, error } = useGetLogs({ refType, refId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Failed to load activity logs
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No activity logs found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Log key={log.id} event={log} sponsorGlobalView={sponsorGlobalView} />
      ))}
    </div>
  );
}
