'use client';

import dayjs from 'dayjs';

import { Tooltip } from '@/components/ui/tooltip';
import { PROJECT_NAME } from '@/constants/project';

import { formatFromNow } from '@/features/comments/utils';
import { getListingIcon } from '@/features/listings/utils/getListingIcon';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';

import { type LogProperties } from './log-types';

interface Properties extends LogProperties {
  showExtraInfo?: 'listing' | 'submission' | 'both';
  hideActorRole?: boolean;
}

export default function LogUser({
  event,
  showExtraInfo,
  hideActorRole = false,
  onListingClick,
  onSubmissionClick,
}: Properties) {
  const now = dayjs();
  const eventTime = dayjs(event.eventTime);
  const date = now.isSame(eventTime, 'day')
    ? formatFromNow(eventTime.fromNow())
    : eventTime.format('HH:mm');
  const utcOffset = -(new Date().getTimezoneOffset() / 60).toFixed(1);
  const offsetString = utcOffset > 0 ? `+${utcOffset}` : utcOffset;
  const fullDate = eventTime.format(`MMM D, YYYY h:mm A [UTC${offsetString}]`);

  const name = event.actor
    ? (event.actor.name ?? event.actor.username)
    : event.sponsor?.name;
  const photo = event.actor ? event.actor.photo : event.sponsor?.logo;
  const id = event.actor ? event.actorId : event.sponsorId;

  const showListingExtraInfo =
    showExtraInfo === 'listing' || showExtraInfo === 'both';
  const showSubmissionExtraInfo =
    showExtraInfo === 'submission' || showExtraInfo === 'both';

  let username = name;
  let icon = photo;
  let avatarId = id;

  if (
    event.actorType === 'SYSTEM' ||
    (event.actorType === 'PLATFORM_ADMIN' && !event.actor)
  ) {
    icon = '/favicon.ico';
    username =
      event.actorType === 'SYSTEM' ? PROJECT_NAME : `${PROJECT_NAME} Admin`;
    avatarId = 'SYSTEM';
  }

  const isTalent =
    event.submission &&
    event?.submission?.user?.username === event.actor?.username &&
    event.actorType !== 'PLATFORM_ADMIN';

  return (
    <div className="flex items-center gap-2">
      <EarnAvatar
        avatar={icon}
        id={avatarId ?? 'username'}
        className="size-6 rounded-full"
      />

      <span className="font-medium text-slate-900">{username}</span>
      {!hideActorRole && isTalent && (
        <span className="text-sm font-medium text-brand-green-50">Talent</span>
      )}
      {event.actorType === 'SPONSOR' && !hideActorRole && !isTalent && (
        <span className="text-sm font-medium text-blue-600">
          {event.actor?.username === event.listing?.poc?.username
            ? 'Creator'
            : 'Sponsor'}
        </span>
      )}
      {event.actorType === 'PLATFORM_ADMIN' && event.actor && (
        <span className="text-sm font-medium text-blue-600">
          Platform Admin
        </span>
      )}
      {showListingExtraInfo && event.listing && onListingClick && (
        <>
          <span className="text-slate-500">in</span>
          <button
            onClick={() => onListingClick(event)}
            className="flex items-center gap-1 text-sm font-medium text-slate-900"
          >
            <Tooltip
              content={
                <p>
                  {event.listing.type.charAt(0).toUpperCase() +
                    event.listing.type.slice(1)}
                </p>
              }
            >
              <img
                className="h-4 min-h-4 w-4 min-w-4 flex-shrink-0 rounded-full"
                alt={`New ${event.listing.type}`}
                src={getListingIcon(event.listing.type!)}
                title={event.listing.type}
              />
            </Tooltip>
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

      <Tooltip contentProps={{ className: 'z-[1000]' }} content={fullDate}>
        <span className="text-sm font-medium text-slate-400">{date}</span>
      </Tooltip>
    </div>
  );
}
