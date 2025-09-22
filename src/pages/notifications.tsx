import { Default } from '@/layouts/Default';

import { NotificationsListWithFilters } from '@/features/notifications/components';

export default function NotificationsPage() {
  return (
    <Default
      className="bg-white"
      meta={<meta name="description" content="Notifications" />}
    >
      <div className="mt-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-[880px]">
          <div className="mx-auto max-w-6xl md:pt-8">
            <div className="relative mb-[72px] md:mb-[88px]">
              <NotificationsListWithFilters />
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
}
