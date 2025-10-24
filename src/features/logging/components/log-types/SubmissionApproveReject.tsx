import { cn } from '@/utils/cn';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { type EventDataMap, EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SubmissionApproveRejectCancelled(props: LogProperties) {
  const { event } = props;

  const status =
    event.eventType === EventType.SUBMISSION_APPROVED
      ? 'Approved'
      : event.eventType === EventType.SUBMISSION_REJECTED
        ? 'Rejected'
        : 'Cancelled';
  const labelStyle = colorMap[status];
  const username = event.submission?.user.username;
  const isProject = event.listing?.type === 'project';

  const reason =
    event.eventType === EventType.SUBMISSION_CANCELLED
      ? (event.data as EventDataMap[EventType.SUBMISSION_CANCELLED]).reason
      : undefined;

  return (
    <p className="items-center text-slate-500">
      {isProject && status === 'Approved' ? 'Hired talent and ' : ''}
      <a href={`/t/${username}`} className="text-slate-900">
        @{username}
      </a>{' '}
      {props.onSubmissionClick ? (
        <button
          className="text-slate-900"
          onClick={() => props.onSubmissionClick!(event)}
        >
          submission
        </button>
      ) : (
        <span>submission</span>
      )}{' '}
      has been
      <span
        className={cn(
          'ml-1 inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
          labelStyle.bg,
          labelStyle.color,
        )}
      >
        {status}
      </span>
      {reason && reason.length > 0 && (
        <>
          with a reason:
          <div className="whitespace-pre-wrap break-all rounded-md bg-slate-50 px-2 py-1 text-slate-600">
            {reason}
          </div>
        </>
      )}
    </p>
  );
}
