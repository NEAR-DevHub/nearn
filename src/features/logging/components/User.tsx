'use client';

import dayjs from 'dayjs';

import { Tooltip } from '@/components/ui/tooltip';

import { formatFromNow } from '@/features/comments/utils';

import { type LogProperties } from './log-types';

interface Properties extends LogProperties {
  globalView?: boolean;
}

export default function User({ event, globalView = false }: Properties) {
  const now = dayjs();
  const date = now.isSame(dayjs(event.eventTime), 'day')
    ? formatFromNow(dayjs(event.eventTime).fromNow())
    : dayjs(event.eventTime).format('HH:mm');
  const fullDate = dayjs(event.eventTime).format('MMM D, YYYY h:mm A');

  const name = event.User
    ? (event.User.name ?? event.User.username)
    : event.sponsor?.name;
  const photo = event.User ? event.User.photo : event.sponsor?.logo;

  return (
    <div className="flex items-center gap-2">
      <img
        src={photo ?? undefined}
        alt={name ?? ''}
        className="size-6 rounded-full"
      />

      <span className="font-medium text-slate-900">{name}</span>
      {globalView && event.sponsor?.slug && event.listing?.sequentialId && (
        <>
          <span className="text-slate-500">in</span>
          <a
            href={`/${event.sponsor?.slug}/${event.listing?.sequentialId}`}
            className="text-sm font-medium text-slate-900"
          >
            {event.listing.title}
          </a>
        </>
      )}
      {event.actorType === 'SPONSOR' && !globalView && (
        <span className="text-sm font-medium text-blue-600">Sponsor</span>
      )}
      <Tooltip content={fullDate}>
        <span className="text-sm font-medium text-slate-400">{date}</span>
      </Tooltip>
    </div>
  );
}
