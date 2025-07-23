import { Separator } from '@radix-ui/react-select';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { Search } from 'lucide-react';
import { memo, useMemo, useRef, useState } from 'react';

import { LoadingSection } from '@/components/shared/LoadingSection';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SponsorLayout } from '@/layouts/Sponsor';
import { useUser } from '@/store/user';

import LogsTimeline from '@/features/logging/components/LogsTimeline';
import { eventFilters, useGetLogs } from '@/features/logging/queries/logs';
import { Banner } from '@/features/sponsor-dashboard/components/Banner';
import { sponsorStatsQuery } from '@/features/sponsor-dashboard/queries/sponsor-stats';

const MemoizedLogsTimeline = memo(LogsTimeline);

export default function ActivityHistory() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');

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

  const { data: logs, isLoading: isLogsLoading } = useGetLogs({
    refType: 'sponsor',
    refId: user?.currentSponsorId ?? '',
    eventTypes,
    searchText,
  });

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
            <MemoizedLogsTimeline logs={logs} sponsorGlobalView />
          )}
        </div>
      </Tabs>
    </SponsorLayout>
  );
}
