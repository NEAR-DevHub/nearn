import { EventVisibility } from '@prisma/client';
import { History } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type SubmissionWithUser } from '@/interface/submission';
import { type User } from '@/interface/user';

import { Comments } from '@/features/comments/components/Comments';
import { type ListingWithSubmissions } from '@/features/listings/types';
import {
  eventFilters,
  useGetLogsInfinite,
} from '@/features/logging/queries/logs';

import ActivityFilters from './ActivityFilters';
import LogsTimeline from './LogsTimeline';

interface Props {
  listing: ListingWithSubmissions;
  submission?: SubmissionWithUser;
  isTemplate?: boolean;
}

export default function PublicLoggingWithComments({
  listing,
  submission,
  isTemplate,
}: Props) {
  const [commentCount, setCommentCount] = useState(0);
  const [tab, setTab] = useState<'comments' | 'activity'>('comments');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');

  const refType = submission ? 'submission' : 'listing';
  const refId = submission ? submission.id : listing.id;

  const {
    data: logsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetLogsInfinite({
    refType,
    refId: refId || '',
    sort,
    eventTypes: !submission ? eventFilters('listing') : undefined,
    maxVisibility: EventVisibility.TALENT,
  });

  const logs = useMemo(
    () => logsData?.pages.flatMap((page) => page.logs) ?? [],
    [logsData],
  );

  // Intersection observer for infinite scroll
  const observerRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    if (tab === 'activity') {
      refetch();
    }
  }, [tab, refetch]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <History className="h-4 w-4" />
          <p>Threads</p>
        </div>

        <p className="text-slate-400">|</p>

        <p className="text-xs text-slate-500">Filter by</p>

        <ActivityFilters
          sort={sort}
          value={tab}
          supportedValues={[
            { label: 'Comments', value: 'comments' },
            { label: 'Activity', value: 'activity' },
          ]}
          onValueChange={(value) => {
            setTab(value as 'comments' | 'activity');
          }}
          onSortChange={setSort}
        />
      </div>
      {tab === 'comments' && (
        <Comments
          isTemplate={isTemplate}
          isAnnounced={listing?.isWinnersAnnounced ?? false}
          listingSlug={listing?.slug ?? ''}
          listingType={listing?.type ?? ''}
          poc={listing?.poc as User}
          sponsorId={listing?.sponsorId}
          isVerified={listing?.sponsor?.isVerified}
          refId={submission ? submission.id : (listing.id ?? '')}
          refType={submission ? 'SUBMISSION' : 'BOUNTY'}
          count={commentCount}
          setCount={setCommentCount}
          submissionAuthor={submission?.user as User}
          isDisabled={!listing.isPublished && listing.status === 'OPEN'}
          hideCount
        />
      )}
      {tab === 'activity' && (
        <>
          <LogsTimeline logs={logs} />

          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={observerRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              ) : (
                <button
                  className="text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
