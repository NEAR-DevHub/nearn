import { Separator } from '@radix-ui/react-select';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { CalendarIcon, Search } from 'lucide-react';
import router from 'next/router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LoadingSection } from '@/components/shared/LoadingSection';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SponsorLayout } from '@/layouts/Sponsor';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import LogsTimeline from '@/features/logging/components/LogsTimeline';
import {
  eventFilters,
  type Log,
  useGetLogsInfinite,
} from '@/features/logging/queries/logs';
import { Banner } from '@/features/sponsor-dashboard/components/Banner';
import { sponsorStatsQuery } from '@/features/sponsor-dashboard/queries/sponsor-stats';

const MemoizedLogsTimeline = memo(LogsTimeline);

export default function ActivityHistory() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({ from: undefined, to: undefined });

  const { data: sponsorStats, isLoading: isStatsLoading } = useQuery(
    sponsorStatsQuery(user?.currentSponsorId),
  );

  const debouncedSetSearchText = useRef(debounce(setSearchText, 300)).current;

  const eventTypes = useMemo(() => {
    switch (activeTab) {
      case 'listings':
        return eventFilters('listing');
      case 'submissions':
        return eventFilters('submission');
      case 'payments':
        return eventFilters('payments');
      case 'team-settings':
        return eventFilters('team');
      case 'sponsor-profile':
        return eventFilters('profile');
      default:
        return undefined;
    }
  }, [activeTab]);

  const {
    data,
    isLoading: isLogsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetLogsInfinite({
    refType: 'sponsor',
    refId: user?.currentSponsorId ?? '',
    eventTypes,
    searchText,
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const logs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.logs);
  }, [data]);

  const onSubmissionClick = useCallback(
    (event: Log) => {
      router.push(
        `/dashboard/listings/${event.listing?.slug}/submissions/${event.submission?.sequentialId}`,
      );
    },
    [router],
  );

  const onListingClick = useCallback(
    (event: Log) => {
      router.push(`/dashboard/listings/${event.listing?.slug}/submissions`);
    },
    [router],
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

  const startOfDay = (numDays: number) => {
    const date = new Date();
    date.setDate(date.getDate() - numDays);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const endOfDay = (numDays: number) => {
    const date = new Date();
    date.setDate(date.getDate() - numDays);
    date.setHours(23, 59, 59, 999);
    return date;
  };
  const commonTimeFilters = useMemo(
    () => [
      {
        label: 'Today',
        value: {
          from: startOfDay(0),
          to: endOfDay(0),
        },
      },
      {
        label: 'Yesterday',
        value: {
          from: startOfDay(1),
          to: endOfDay(0),
        },
      },
      {
        label: 'Last 3 days',
        value: {
          from: startOfDay(3),
          to: endOfDay(0),
        },
      },
      {
        label: 'Last 7 days',
        value: {
          from: startOfDay(7),
          to: endOfDay(0),
        },
      },
      {
        label: 'Last 14 days',
        value: {
          from: startOfDay(14),
          to: endOfDay(0),
        },
      },
      {
        label: 'Last month',
        value: {
          from: startOfDay(30),
          to: endOfDay(0),
        },
      },
    ],
    [],
  );

  const defaultMonth = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    return date;
  }, [dateRange.from]);

  return (
    <SponsorLayout>
      <Banner stats={sponsorStats} isLoading={isStatsLoading} />

      <div className="flex w-full items-center justify-between">
        <div className="flex items-center whitespace-nowrap">
          <p className="text-lg font-semibold text-slate-800">
            Activity History{' '}
          </p>
          <Separator className="mx-3 h-6 w-px bg-slate-300" />
          <p className="text-slate-500">The one place to track all activity</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex w-40 items-center justify-start gap-2 px-4 py-2 text-left text-xs font-medium text-slate-500',
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd')} -{' '}
                      {format(dateRange.to, 'LLL dd')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>All time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <div className="w-32 border-r p-1.5">
                  <div className="flex flex-col gap-1">
                    {commonTimeFilters.map((filter) => (
                      <Button
                        key={filter.label}
                        variant="ghost"
                        size="sm"
                        className="justify-start p-1.5 text-sm text-slate-600"
                        onClick={() => setDateRange(filter.value)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="w-">
                  <Calendar
                    mode="range"
                    defaultMonth={defaultMonth}
                    selected={dateRange}
                    onSelect={(range) =>
                      setDateRange(range || { from: undefined, to: undefined })
                    }
                    numberOfMonths={2}
                    showOutsideDays={false}
                    className="gap-3 px-3 py-1.5"
                    disabled={(date) => date > new Date()}
                    classNames={{
                      range_start: 'text-white bg-slate-900 rounded-l-md',
                      range_end: 'text-white bg-slate-900 rounded-r-md',
                      range_middle: 'text-slate-600 bg-slate-100',
                      month_caption:
                        'text-slate-600 flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
                      disabled: 'text-slate-400 ',
                      day: 'text-slate-600 group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
                      today: 'text-slate-600',
                    }}
                  />
                  <div className="flex items-center justify-end gap-2.5 p-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium text-slate-500"
                      onClick={() =>
                        setDateRange({ from: undefined, to: undefined })
                      }
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-slate-900 text-sm font-medium"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="placeholder:text-md border-slate-300 bg-white pl-9 placeholder:font-medium placeholder:text-slate-400 focus-visible:ring-black"
              onChange={(e) => debouncedSetSearchText(e.target.value)}
              placeholder="Search by member name or listing..."
              type="text"
            />
          </div>
        </div>
      </div>
      <Tabs
        defaultValue="all"
        className="mt-5"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="team-settings">Team Settings</TabsTrigger>
          <TabsTrigger value="sponsor-profile">Sponsor Profile</TabsTrigger>
        </TabsList>
        <div className="h-0.5 w-full bg-slate-200" />

        <div className="mt-5">
          {isLogsLoading ? (
            <LoadingSection />
          ) : (
            <>
              <MemoizedLogsTimeline
                logs={logs}
                showExtraInfo="both"
                hideActorRole
                onListingClick={onListingClick}
                onSubmissionClick={onSubmissionClick}
              />

              {/* Load more trigger */}
              {hasNextPage && (
                <div ref={observerRef} className="flex justify-center py-8">
                  {isFetchingNextPage ? (
                    <LoadingSection />
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}

              {!hasNextPage && logs.length > 0 && (
                <p className="py-4 text-center text-sm text-slate-500">
                  No more activity to show
                </p>
              )}
            </>
          )}
        </div>
      </Tabs>
    </SponsorLayout>
  );
}
