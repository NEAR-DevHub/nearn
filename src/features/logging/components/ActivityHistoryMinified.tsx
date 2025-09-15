import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/cn';

import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

import { useGetLogsInfinite } from '../queries';
import Log from './Log';
import LogsTimeline from './LogsTimeline';

interface ActivityHistoryMinifiedProps {
  submission: SubmissionWithListingUser;
  className?: string;
}

export const ActivityHistoryMinified = ({
  submission,
  className,
}: ActivityHistoryMinifiedProps) => {
  const [open, setOpen] = useState(false);

  const {
    data: logs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetLogsInfinite({
    refType: 'submission',
    refId: submission?.id,
  });

  const lastActivity = useMemo(() => {
    const allLogs = logs?.pages.flatMap((page) => page.logs) ?? [];
    return allLogs[0]; // Most recent activity
  }, [logs]);

  const activityCount = useMemo(() => {
    return logs?.pages[0]?.pagination.totalCount ?? 0;
  }, [logs]);

  if (!lastActivity && !isLoading) {
    return null;
  }

  return (
    <div className={cn('max-w-xs', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="group w-80 cursor-pointer">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    <p className="text-sm text-slate-400">
                      Loading activity...
                    </p>
                  </div>
                ) : lastActivity ? (
                  <Log event={lastActivity} />
                ) : (
                  <p className="text-sm text-slate-400">No activity</p>
                )}
              </div>
              {activityCount > 1 && (
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-xs">{activityCount}</span>
                </div>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-96"
          side="left"
          align="start"
          sideOffset={5}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold">Submission Activity</span>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
              <LogsTimeline
                logs={logs?.pages.flatMap((page) => page.logs) ?? []}
              />
              {hasNextPage && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading more...
                      </span>
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
