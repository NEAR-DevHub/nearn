'use client';

import { Loader2 } from 'lucide-react';
import router from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import {
  useMarkNotificationsAsRead,
  useNotificationsInfinite,
} from '../queries/useNotifications';
import { getNotificationAction } from '../utils/notification-messages';
import { Notification as NotificationComponent } from './Notification';

interface NotificationsListProps {
  sponsorIds?: string[];
  showTalent?: boolean;
}

export function NotificationsListWithFilters({
  sponsorIds,
  showTalent,
}: NotificationsListProps) {
  const [activeTab, setActiveTab] = useState<'Unread' | 'Read'>('Unread');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useNotificationsInfinite({
    read: activeTab === 'Read',
    sponsorIds,
    showTalent,
  });

  const { mutate: markAsRead } = useMarkNotificationsAsRead();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleMarkAsRead = useCallback(
    (notificationIds: string[]) => {
      markAsRead(notificationIds);
    },
    [markAsRead],
  );

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

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8')}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('py-8 text-center')}>
        <p className="text-sm text-muted-foreground">
          Failed to load notifications
        </p>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as 'Unread' | 'Read')}
    >
      <TabsList className="w-full justify-start rounded-none border-b-2 px-4 py-3">
        <TabsTrigger
          value="Unread"
          className="data-[state=active]:bg-transparent data-[state=active]:after:bottom-[-5px]"
        >
          Unread
        </TabsTrigger>
        <TabsTrigger
          value="Read"
          className="data-[state=active]:bg-transparent data-[state=active]:after:bottom-[-5px]"
        >
          Read
        </TabsTrigger>
      </TabsList>
      <TabsContent value={activeTab}>
        <ScrollArea className="h-[400px]">
          {notifications.map((notification) => {
            const { link: primaryLink } = getNotificationAction(notification);
            return (
              <div key={notification.id}>
                <div
                  className={cn('cursor-pointer border-b border-slate-200')}
                  onClick={() => {
                    if (!notification.deliveredAt) {
                      handleMarkAsRead([notification.id]);
                    }
                    router.push(primaryLink);
                  }}
                >
                  <NotificationComponent notification={notification} />
                </div>
              </div>
            );
          })}

          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
