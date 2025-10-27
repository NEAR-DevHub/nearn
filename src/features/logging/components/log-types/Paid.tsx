import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { getURLSanitized } from '@/utils/getURLSanitized';
import { nthLabelGenerator } from '@/utils/rank';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export function MarkedAsPaid({ event }: LogProperties) {
  const milestone = event.milestone;

  const isMilestonePayment = Boolean(milestone);

  return isMilestonePayment ? (
    <p className="text-slate-500">
      <span className="text-slate-900">
        {milestone?.milestoneIndex &&
          nthLabelGenerator(milestone?.milestoneIndex, false)}
      </span>{' '}
      milestone marked as paid
    </p>
  ) : (
    'Marked as paid'
  );
}

export default function Paid({ event, onSubmissionClick }: LogProperties) {
  const { link } = event.data as EventDataMap[EventType.SUBMISSION_PAID];
  const username = event.submission?.user.username;
  const milestone = event.milestone;

  const isMilestonePayment = Boolean(milestone);

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
      <Link href={`/t/${username}`} className="text-slate-900">
        @{username}
      </Link>{' '}
      {isMilestonePayment && milestone ? (
        <>
          <span className="text-slate-900">
            {milestone?.milestoneIndex &&
              nthLabelGenerator(milestone?.milestoneIndex, false)}
          </span>{' '}
          milestone{' '}
        </>
      ) : onSubmissionClick ? (
        <button
          className="text-slate-900"
          onClick={() => onSubmissionClick(event)}
        >
          submission
        </button>
      ) : (
        <span>submission</span>
      )}
      <>
        {' and status changed to '}
        <span className="inline-block rounded-xl bg-emerald-100 px-3 py-0.5 text-sm text-emerald-800">
          Paid
        </span>
      </>
    </p>
  );
}
