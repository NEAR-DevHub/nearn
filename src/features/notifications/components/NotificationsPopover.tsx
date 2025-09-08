'use client';

import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  type Notification,
  useNotificationsInfinite,
} from '../queries/useNotifications';
import { NotificationsList } from './NotificationsList';

export function NotificationsPopover() {
  const router = useRouter();
  const { data } = useNotificationsInfinite({ read: false, limit: 10 });

  const unreadCount =
    data?.pages
      .flatMap((page) => page.notifications)
      .filter((n) => !n.deliveredAt).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.event) return;

    const event = notification.event;

    if (event.listing?.slug) {
      router.push(`/listings/${event.listing.type}/${event.listing.slug}`);
    } else if (event.submission?.sequentialId && event.listing?.slug) {
      router.push(
        `/listings/${event.listing.type}/${event.listing.slug}/submission/${event.submission.sequentialId}`,
      );
    } else if (event.sponsor?.slug) {
      router.push(`/sponsor/${event.sponsor.slug}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <NotificationsList onNotificationClick={handleNotificationClick} />
      </PopoverContent>
    </Popover>
  );
}
