import { LoadingSection } from '@/components/shared/LoadingSection';
import { SponsorLayout } from '@/layouts/Sponsor';
import { useUser } from '@/store/user';

import LogsTimeline from '@/features/logging/components/LogsTimeline';

export default function ActivityHistory() {
  const { user, isLoading } = useUser();

  return (
    <SponsorLayout>
      {isLoading && <LoadingSection />}
      {!isLoading && (
        <LogsTimeline
          refType="sponsor"
          refId={user?.currentSponsorId ?? ''}
          sponsorGlobalView
        />
      )}
    </SponsorLayout>
  );
}
