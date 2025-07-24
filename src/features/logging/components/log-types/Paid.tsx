import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { getURLSanitized } from '@/utils/getURLSanitized';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function Paid({ event }: LogProperties) {
  const { link } = event.data as EventDataMap[EventType.SUBMISSION_PAID];
  const username = event.submission?.user.username;
  return (
    <p className="items-center gap-1 text-slate-500">
      Added payment link{' '}
      <Link
        href={getURLSanitized(link)}
        target="_blank"
        className="inline-block items-center"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>{' '}
      for{' '}
      <Link href={`/t/${username}`} className="font-medium">
        @{username}
      </Link>{' '}
      submission and status changed to{' '}
      <span className="inline-block rounded-xl bg-emerald-100 px-3 py-0.5 text-emerald-800">
        Paid
      </span>
    </p>
  );
}
