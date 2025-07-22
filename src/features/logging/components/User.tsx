'use client';

import { type EventLog } from '@prisma/client';
import dayjs from 'dayjs';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';

import { formatFromNow } from '@/features/comments/utils';

import { useGetSponsorOrUser } from '../queries';

interface Properties {
  event: Pick<EventLog, 'actorId' | 'actorType' | 'sponsorId' | 'eventTime'>;
}

export default function User({ event }: Properties) {
  const actorId = event.actorId || event.sponsorId;

  const { data: user } = useGetSponsorOrUser({
    id: actorId!,
    type: !event.actorId ? 'sponsor' : 'user',
  });

  const now = dayjs();
  const date = now.isSame(dayjs(event.eventTime), 'day')
    ? formatFromNow(dayjs(event.eventTime).fromNow())
    : dayjs(event.eventTime).format('HH:mm');
  const fullDate = dayjs(event.eventTime).format('MMM D, YYYY h:mm A');

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-6">
        <AvatarImage src={user?.photo ?? undefined} />
      </Avatar>

      <span className="text-sm font-medium">{user?.name}</span>
      <Tooltip content={fullDate}>
        <span className="text-sm text-muted-foreground">{date}</span>
      </Tooltip>
    </div>
  );
}
