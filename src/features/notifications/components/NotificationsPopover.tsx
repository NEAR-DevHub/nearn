'use client';

import { Bell, Settings } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/store/user';

import { NotificationSettingsModal } from '@/features/talent/components/NotificationSettingModal';

import {
  useMarkNotificationsAsRead,
  useNotificationsInfinite,
} from '../queries/useNotifications';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { mutate: markAsRead } = useMarkNotificationsAsRead();

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];
  const unreadCount = notifications.filter((n) => !n.deliveredAt).length || 0;

  return (
    <Popover
      onOpenChange={(open) => {
        if (unreadCount > 0 && !open) {
          markAsRead(
            notifications.filter((n) => !n.deliveredAt).map((n) => n.id),
          );
        }
      }}
    >
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
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
      <PopoverContent
        align="end"
        className="flex w-[440px] flex-col gap-3 rounded-xl p-0"
      >
        <div className="flex items-center justify-between border-b">
          <AccountFilter
            userSponsors={user?.UserSponsors || []}
            selectedSponsorIds={selectedSponsorIds}
            showTalent={showTalentNotifications}
            onSelectionChange={setSelectedSponsorIds}
            onTalentToggle={setShowTalentNotifications}
          />
          <Button
            variant="ghost"
            size="icon"
            className="mr-5 h-5 w-5 p-0"
            onClick={() => {
              setIsSettingsOpen(true);
            }}
          >
            <Settings className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
        <NotificationsListWithFilters
          sponsorIds={selectedSponsorIds}
          showTalent={showTalentNotifications}
        />
      </PopoverContent>
    </Popover>
  );
}
