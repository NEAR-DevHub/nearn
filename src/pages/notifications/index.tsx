import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Default } from '@/layouts/Default';

import { NotificationsListWithFilters } from '@/features/notifications/components';
import { useNotificationsInfinite } from '@/features/notifications/queries/useNotifications';

export default function NotificationsPage() {
  const router = useRouter();
  const { data } = useNotificationsInfinite({
    read: false,
    limit: 10,
  });

  useEffect(() => {
    const unreadCount = data?.pages[0]?.pagination.totalCount || 0;
    if (unreadCount > 0) {
      localStorage.setItem('notificationCount', unreadCount.toString());
    }
  }, [data]);
  return (
    <Default
      className="bg-white"
      hideListingNavigation
      hideFooter
      meta={<meta name="description" content="Notifications" />}
    >
      <div className="mt-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[880px]">
          <div className="mx-auto max-w-6xl md:pt-8">
            <div className="relative mb-[72px] md:mb-[88px]">
              <NotificationsListWithFilters
                sponsorIds={[]}
                onSettingsOpen={() => {
                  router.push('/notifications/settings');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
}
