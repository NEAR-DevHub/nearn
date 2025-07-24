import { Clock2, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import ActivityFilters from '@/features/logging/components/ActivityFilters';
import LogsTimeline from '@/features/logging/components/LogsTimeline';
import { eventFilters, useGetLogsInfinite } from '@/features/logging/queries';

interface ActivityModalProps {
  listingId?: string;
}

export const ActivityModal = ({ listingId }: ActivityModalProps) => {
  const [filter, setFilter] = useState<
    'all' | 'listing' | 'submission' | 'payments' | 'comments'
  >('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: logsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetLogsInfinite({
    refType: 'listing',
    refId: listingId,
    eventTypes: filter === 'all' ? undefined : eventFilters(filter),
    sort,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);
  const logs = useMemo(
    () => logsData?.pages.flatMap((page) => page.logs) ?? [],
    [logsData],
  );

  if (!listingId) return null;
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-slate-400">
          <Clock2 className="h-4 w-4" />
          Listing Activity
        </Button>
      </SheetTrigger>
      <SheetContent
        className="min-w-[600px] overflow-y-auto p-6 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300"
        side="right"
      >
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl font-bold text-slate-900">
            Listing Activity
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            View the full activity history of the listing, including edits,
            comments, and actions from both contributors and sponsors.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs text-slate-500">Filter By</p>
          <ActivityFilters
            sort={sort}
            value={filter}
            supportedValues={[
              { label: 'Listing Edits', value: 'listing' },
              { label: 'Submissions', value: 'submission' },
              { label: 'Payments', value: 'payments' },
              { label: 'Comments', value: 'comments' },
              { label: 'All Activity', value: 'all' },
            ]}
            onValueChange={(value) => {
              setFilter(
                value as
                  | 'all'
                  | 'listing'
                  | 'submission'
                  | 'payments'
                  | 'comments',
              );
            }}
            onSortChange={setSort}
          />
        </div>
        <div className="mt-5">
          {logs.length === 0 && (
            <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-2">
              <Clock2 className="size-12 text-slate-400" />
              <p className="mt-0.5 text-lg font-semibold text-slate-900">
                No activity yet
              </p>
              <p className="text-center text-slate-500">
                Once an action is performed,
                <br /> it will show up here.
              </p>
            </div>
          )}
          {logs.length > 0 && <LogsTimeline logs={logs} />}
          {hasNextPage && (
            <Button
              variant="ghost"
              className="text-slate-400"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Load More'
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
