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

import { NotificationSettingsModal } from '@/features/notification-settings/components/NotificationSettingModal';

import { useNotificationsInfinite } from '../queries/useNotifications';
import { AccountFilter } from './AccountFilter';
import { NotificationsListWithFilters } from './NotificationsList';

export function NotificationsPopover() {
  const { user } = useUser();
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<
    string[] | undefined
  >(undefined);
  const [showTalentNotifications, setShowTalentNotifications] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useNotificationsInfinite({
    read: false,
    limit: 10,
    sponsorIds: selectedSponsorIds,
    showTalent: showTalentNotifications,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const unreadCount = data?.pages?.[0]?.pagination.totalCount || 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <>
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute right-0 top-0 scale-[0.7] rounded-full p-0.5 px-1.5"
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
          <div className="border-b">
            <AccountFilter
              userSponsors={user?.UserSponsors || []}
              selectedSponsorIds={selectedSponsorIds}
              showTalent={showTalentNotifications}
              onSelectionChange={setSelectedSponsorIds}
              onTalentToggle={setShowTalentNotifications}
            />
          </div>
          <NotificationsListWithFilters
            sponsorIds={selectedSponsorIds}
            showTalent={showTalentNotifications}
            onSettingsOpen={() => setIsSettingsOpen(true)}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
