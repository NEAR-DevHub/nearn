'use client';

import { ListCheck, Loader2, Settings } from 'lucide-react';
import router from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ExternalImage } from '@/components/ui/cloudinary-image';
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
  onSettingsOpen?: () => void;
}

export function NotificationsListWithFilters({
  sponsorIds,
  showTalent,
  onSettingsOpen,
}: NotificationsListProps) {
  const [activeTab, setActiveTab] = useState<'Unread' | 'Read' | null>(null);

  // Check if there are any unread notifications
  const { data: unreadData } = useNotificationsInfinite({
    read: false,
    limit: 1,
    sponsorIds,
    showTalent,
  });

  useEffect(() => {
    if (activeTab === null && unreadData) {
      const hasUnread = (unreadData.pages[0]?.notifications.length ?? 0) > 0;
      setActiveTab(hasUnread ? 'Unread' : 'Read');
    }
  }, [activeTab, unreadData]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useNotificationsInfinite(
    {
      read: activeTab === 'Read',
      sponsorIds,
      showTalent,
    },
    {
      enabled: activeTab !== null,
    },
  );

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

  if (isLoading || activeTab === null) {
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
    <>
      <Tabs
        value={activeTab || 'Unread'}
        onValueChange={(value) => setActiveTab(value as 'Unread' | 'Read')}
      >
        <div className="relative z-10 flex items-center justify-between px-4 pt-3">
          <div className="absolute bottom-[1px] left-0 h-[2px] w-full bg-slate-200 md:bottom-[-1px]" />
          <TabsList className="w-full justify-start rounded-none">
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
            <div className="ml-auto flex items-center gap-1">
              {activeTab === 'Unread' && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const unreadIds = notifications
                      .filter((n) => !n.deliveredAt)
                      .map((n) => n.id);
                    if (unreadIds.length > 0) {
                      handleMarkAsRead(unreadIds);
                    }
                  }}
                  className="h-6 w-6 p-0"
                  title="Mark all as read"
                >
                  <ListCheck className="h-6 w-6 text-slate-500" />
                </Button>
              )}
              {onSettingsOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={onSettingsOpen}
                >
                  <Settings className="h-6 w-6 text-slate-500" />
                </Button>
              )}
            </div>
          </TabsList>
        </div>
        <TabsContent value={activeTab} className="mt-0 pt-0">
          <ScrollArea className="h-[400px] pt-0">
            {notifications.length === 0 && (
              <div className="flex h-[400px] flex-col justify-center text-center">
                <ExternalImage
                  className="mx-auto w-32"
                  alt={'talent empty'}
                  src={'/bg/notify-none.svg'}
                />
                <p className="mt-5 font-semibold text-slate-600">
                  You are all caught up!
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  You will be notified here about comments,
                  <br /> submission updates, event changes, and messages
                </p>
              </div>
            )}

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
    </>
  );
}
