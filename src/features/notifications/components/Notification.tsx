import dayjs from 'dayjs';
import { CheckCircle2, Dot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { PROJECT_NAME } from '@/constants/project';

import { formatFromNow } from '@/features/comments/utils';
import { getListingIcon } from '@/features/listings/utils/getListingIcon';

import {
  type Notification as NotificationData,
  useMarkNotificationsAsRead,
} from '../queries/useNotifications';
import { type NotificationType } from '../types';
import { getNotificationAction } from '../utils/notification-messages';

export function Notification({
  notification,
}: {
  notification: NotificationData<NotificationType>;
}) {
  const { mutate: markAsRead } = useMarkNotificationsAsRead();

  const notificationTime = dayjs(notification.createdAt);
  const date = notificationTime.isToday()
    ? formatFromNow(notificationTime.fromNow())
    : notificationTime.format('MMM D, YYYY');
  const utcOffset = -(new Date().getTimezoneOffset() / 60).toFixed(1);
  const offsetString = utcOffset > 0 ? `+${utcOffset}` : utcOffset;
  const fullDate = notificationTime.format(
    `MMM D, YYYY h:mm A [UTC${offsetString}]`,
  );

  const { message, subtitle, actor } = getNotificationAction(notification);
  let username;
  let icon;

  switch (actor) {
    case 'platform':
      icon = '/favicon.ico';
      username = PROJECT_NAME;
      break;

    case 'sponsor':
      icon = notification?.sponsor?.logo;
      username = notification?.sponsor?.name;
      break;

    case 'user':
      icon = notification?.actor?.photo;
      username = notification?.actor?.name ?? notification?.actor?.username;
      break;
  }

  if (!username && !icon) {
    icon = '/favicon.ico';
    username = PROJECT_NAME;
  }

  return (
    <div className="group flex items-start gap-2 p-4 hover:bg-slate-50">
      <Image
        src={icon ?? ''}
        alt={username ?? ''}
        className="size-6 flex-shrink-0 rounded-full"
        width={24}
        height={24}
      />
      <div className="flex flex-col gap-1">
        <div className="flex w-full gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-slate-600">
              {actor !== 'platform' && (
                <span className="font-medium text-slate-900">{username} </span>
              )}
              {message}
              {notification?.listing && (
                <>
                  {' '}
                  <span className="text-slate-500">in</span>{' '}
                  <Link
                    href={`/${notification?.sponsor?.slug}/${notification?.listing.sequentialId}/`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    <Tooltip
                      content={
                        <p>
                          {notification?.listing.type.charAt(0).toUpperCase() +
                            notification?.listing.type.slice(1)}
                        </p>
                      }
                      triggerClassName="inline-flex h-fit gap-1 p-0"
                    >
                      <Image
                        className="size-4 flex-shrink-0 translate-y-0.5 rounded-full"
                        width={16}
                        height={16}
                        alt={`New ${notification?.listing.type}`}
                        src={getListingIcon(notification?.listing.type!)}
                        title={notification?.listing.type}
                      />
                    </Tooltip>{' '}
                    <span>{notification?.listing.title}</span>
                  </Link>
                </>
              )}
              {notification?.submission && notification?.listing && (
                <>
                  {' '}
                  <span className="text-slate-500">for</span>{' '}
                  <Link
                    href={`/${notification?.sponsor?.slug}/${notification?.listing.sequentialId}/${notification?.submission.sequentialId}`}
                    className="font-medium text-slate-900 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    #{notification?.submission.sequentialId}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
        <p className="text-slate-500">{subtitle}</p>
      </div>
      <div className="flex-shrink-0 flex-col">
        <Tooltip
          contentProps={{ className: 'z-[1000]' }}
          content={fullDate}
          triggerClassName="flex flex-shrink-0 ml-auto"
        >
          {notification.deliveredAt === null && (
            <Dot className="h-4 w-4 scale-150 text-red-500" />
          )}
          <span className="text-sm font-medium text-slate-400">{date}</span>
        </Tooltip>
        {notification.deliveredAt === null && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto flex h-6 w-6 p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead([notification.id]);
            }}
            title="Mark as read"
          >
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
