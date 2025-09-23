import { useState } from 'react';

import { Default } from '@/layouts/Default';

import { NotificationsListWithFilters } from '@/features/notifications/components';
import { NotificationSettingsModal } from '@/features/talent/components/NotificationSettingModal';

export default function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);
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
