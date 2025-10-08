import { useEffect, useState } from 'react';

import { Default } from '@/layouts/Default';

import { NotificationSettingsModal } from '@/features/notification-settings/components/NotificationSettingModal';
import { NotificationsListWithFilters } from '@/features/notifications/components';
import { useNotificationsInfinite } from '@/features/notifications/queries/useNotifications';

export default function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);

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
      meta={<meta name="description" content="Notifications" />}
    >
      <NotificationSettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <div className="mt-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[880px]">
          <div className="mx-auto max-w-6xl md:pt-8">
            <div className="relative mb-[72px] md:mb-[88px]">
              <NotificationsListWithFilters
                sponsorIds={[]}
                onSettingsOpen={() => setIsOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
}
