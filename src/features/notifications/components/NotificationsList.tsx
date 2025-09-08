'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';

import {
  type Notification,
  useMarkNotificationsAsRead,
  useNotificationsInfinite,
} from '../queries/useNotifications';
import { getNotificationData } from '../utils/notification-messages';

interface NotificationsListProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsList({
  className,
  onNotificationClick,
}: NotificationsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useNotificationsInfinite({ read: false });

  const { mutate: markAsRead } = useMarkNotificationsAsRead();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleMarkAsRead = useCallback(
    (notificationIds: string[]) => {
      markAsRead(notificationIds);
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    const allNotificationIds =
      data?.pages
        .flatMap((page) => page.notifications)
        .filter((n) => !n.deliveredAt)
        .map((n) => n.id) || [];

    if (allNotificationIds.length > 0) {
      handleMarkAsRead(allNotificationIds);
    }
  }, [data, handleMarkAsRead]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];
  const unreadCount = notifications.filter((n) => !n.deliveredAt).length;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="text-sm text-muted-foreground">
          Failed to load notifications
        </p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No new notifications</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <Check className="mr-1 h-3 w-3" />
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        {notifications.map((notification, index) => {
          const isUnread = !notification.deliveredAt;
          const { message, subtitle } = getNotificationData(notification);

          return (
            <div key={notification.id}>
              {index > 0 && <Separator />}
              <div
                className={cn(
                  'cursor-pointer px-4 py-3 transition-colors hover:bg-muted/50',
                  isUnread && 'bg-muted/30',
                )}
                onClick={() => {
                  if (isUnread) {
                    handleMarkAsRead([notification.id]);
                  }
                  onNotificationClick?.(notification);
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-1.5 h-2 w-2 rounded-full',
                      isUnread ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{message}</p>
                    {subtitle && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {subtitle}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
