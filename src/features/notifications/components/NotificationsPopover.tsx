'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/store/user';

import { useNotificationsInfinite } from '../queries/useNotifications';
import { AccountFilter } from './AccountFilter';
import { NotificationsListWithFilters } from './NotificationsList';

export function NotificationsPopover() {
  const { user } = useUser();
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<
    string[] | undefined
  >(undefined);
  const [showTalentNotifications, setShowTalentNotifications] = useState(true);

  const { data } = useNotificationsInfinite({
    read: false,
    limit: 10,
    sponsorIds: selectedSponsorIds,
    showTalent: showTalentNotifications,
  });

  const unreadCount =
    data?.pages
      .flatMap((page) => page.notifications)
      .filter((n) => !n.deliveredAt).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-[440px] flex-col gap-3 p-0">
        <AccountFilter
          userSponsors={user?.UserSponsors || []}
          selectedSponsorIds={selectedSponsorIds}
          showTalent={showTalentNotifications}
          onSelectionChange={setSelectedSponsorIds}
          onTalentToggle={setShowTalentNotifications}
        />
        <NotificationsListWithFilters sponsorIds={selectedSponsorIds} />
      </PopoverContent>
    </Popover>
  );
}
