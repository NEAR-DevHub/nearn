'use client';

import dayjs from 'dayjs';
import Image from 'next/image';

import { Tooltip } from '@/components/ui/tooltip';
import { PROJECT_NAME } from '@/constants/project';

import { formatFromNow } from '@/features/comments/utils';

import { type LogProperties } from './log-types';

interface Properties extends LogProperties {
  showExtraInfo?: 'listing' | 'submission' | 'both';
  hideActorRole?: boolean;
}

export default function User({
  event,
  showExtraInfo,
  hideActorRole = false,
  onListingClick,
  onSubmissionClick,
}: Properties) {
  const now = dayjs();
  const date = now.isSame(dayjs(event.eventTime), 'day')
    ? formatFromNow(dayjs(event.eventTime).fromNow())
    : dayjs(event.eventTime).format('HH:mm');
  const fullDate = dayjs(event.eventTime).format('MMM D, YYYY h:mm A');

  const name = event.actor
    ? (event.actor.name ?? event.actor.username)
    : event.sponsor?.name;
  const photo = event.actor ? event.actor.photo : event.sponsor?.logo;

  const showListingExtraInfo =
    showExtraInfo === 'listing' || showExtraInfo === 'both';
  const showSubmissionExtraInfo =
    showExtraInfo === 'submission' || showExtraInfo === 'both';

  if (event.actorType === 'SYSTEM') {
    return (
      <div className="flex items-center gap-2">
        <Image
          src={'/favicon.ico'}
          alt={'System'}
          className="size-6 rounded-full"
          width={24}
          height={24}
        />
        <span className="text-sm font-medium text-slate-900">
          {PROJECT_NAME}
        </span>
        <Tooltip content={fullDate}>
          <span className="text-sm font-medium text-slate-400">{date}</span>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Image
        src={photo ?? ''}
        alt={name ?? ''}
        className="size-6 rounded-full"
        width={24}
        height={24}
      />

      <span className="font-medium text-slate-900">{name}</span>
      {event.actorType === 'SPONSOR' && !hideActorRole && (
        <span className="text-sm font-medium text-blue-600">
          {event.actor?.username === event.listing?.poc?.username
            ? 'Creator'
            : 'Sponsor'}
        </span>
      )}
      {showListingExtraInfo && event.listing && onListingClick && (
        <>
          <span className="text-slate-500">in</span>
          <button
            onClick={() => onListingClick(event)}
            className="text-sm font-medium text-slate-900"
          >
            {event.listing.title}
          </button>
        </>
      )}
      {showSubmissionExtraInfo && event.submission && onSubmissionClick && (
        <>
          <span className="text-slate-500">for</span>
          <button
            onClick={() => onSubmissionClick(event)}
            className="text-sm font-medium text-slate-900"
          >
            #{event.submission.sequentialId}
          </button>
        </>
      )}

      <Tooltip content={fullDate}>
        <span className="text-sm font-medium text-slate-400">{date}</span>
      </Tooltip>
    </div>
  );
}
