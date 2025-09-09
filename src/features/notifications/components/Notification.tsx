import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';

import { Tooltip } from '@/components/ui/tooltip';
import { PROJECT_NAME } from '@/constants/project';

import { formatFromNow } from '@/features/comments/utils';
import { getListingIcon } from '@/features/listings/utils/getListingIcon';

import { type Notification as NotificationType } from '../queries/useNotifications';
import { getNotificationAction } from '../utils/notification-messages';

export function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const event = notification.event;

  const now = dayjs();
  const eventTime = dayjs(event?.eventTime);
  const date = now.isSame(eventTime, 'day')
    ? formatFromNow(eventTime.fromNow())
    : eventTime.format('HH:mm');
  const utcOffset = -(new Date().getTimezoneOffset() / 60).toFixed(1);
  const offsetString = utcOffset > 0 ? `+${utcOffset}` : utcOffset;
  const fullDate = eventTime.format(`MMM D, YYYY h:mm A [UTC${offsetString}]`);

  const name = event?.actor
    ? (event.actor.name ?? event.actor.username)
    : event?.sponsor?.name;
  const photo = event?.actor ? event.actor.photo : event?.sponsor?.logo;

  let username = name;
  let icon = photo;

  if (
    event?.actorType === 'SYSTEM' ||
    (event?.actorType === 'PLATFORM_ADMIN' && !event?.actor)
  ) {
    icon = '/favicon.ico';
    username =
      event?.actorType === 'SYSTEM' ? PROJECT_NAME : `${PROJECT_NAME} Admin`;
  }

  const { message, subtitle } = getNotificationAction(notification);

  return (
    <div className="flex items-start gap-2 p-4">
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
              <span className="font-medium text-slate-900">{username}</span>{' '}
              {message}
              {event?.listing && (
                <>
                  {' '}
                  <span className="text-slate-500">in</span>{' '}
                  <Link
                    href={`/${event.sponsor?.slug}/${event.listing.sequentialId}/`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    <Tooltip
                      content={
                        <p>
                          {event.listing.type.charAt(0).toUpperCase() +
                            event.listing.type.slice(1)}
                        </p>
                      }
                      triggerClassName="inline-flex h-fit gap-1 p-0"
                    >
                      <Image
                        className="size-4 flex-shrink-0 translate-y-0.5 rounded-full"
                        width={16}
                        height={16}
                        alt={`New ${event.listing.type}`}
                        src={getListingIcon(event.listing.type!)}
                        title={event.listing.type}
                      />
                    </Tooltip>{' '}
                    <span>{event.listing.title}</span>
                  </Link>
                </>
              )}
              {event?.submission && event?.listing && (
                <>
                  {' '}
                  <span className="text-slate-500">for</span>{' '}
                  <Link
                    href={`/${event.sponsor?.slug}/${event.listing.sequentialId}/${event.submission.sequentialId}`}
                    className="font-medium text-slate-900 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    #{event.submission.sequentialId}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
        <p className="text-slate-500">{subtitle}</p>
      </div>
      <Tooltip
        contentProps={{ className: 'z-[1000]' }}
        content={fullDate}
        triggerClassName="flex-shrink-0 ml-auto"
      >
        <span className="text-sm font-medium text-slate-400">{date}</span>
      </Tooltip>
    </div>
  );
}
