import { cn } from '@/utils/cn';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SubmissionLabelChange(props: LogProperties) {
  const { event } = props;

  const status =
    event.eventType === EventType.SUBMISSION_APPROVED ? 'Approved' : 'Rejected';

  const labelStyle = colorMap[status];
  const username = event.submission?.user.username;

  return (
    <p className="items-center text-slate-500">
      <a href={`/t/${username}`} className="font-medium">
        @{username}
      </a>{' '}
      <button
        className="font-medium"
        onClick={() => props.onSubmissionClick?.(event)}
      >
        submission
      </button>{' '}
      has been
      <span
        className={cn(
          'inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
          labelStyle.bg,
          labelStyle.color,
        )}
      >
        {status}
      </span>
    </p>
  );
}
