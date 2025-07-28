import { cn } from '@/utils/cn';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SubmissionLabelChange(props: LogProperties) {
  const { event } = props;

  const data = event.data as EventDataMap[EventType.SUBMISSION_LABEL_CHANGED];
  const after = data.after;

  const labelStyle = colorMap[after];
  const username = event.submission?.user.username;

  return (
    <p className="items-center gap-1 text-slate-500">
      Changed{' '}
      <a href={`/t/${username}`} className="font-medium">
        @{username}
      </a>{' '}
      <a
        className="font-medium"
        onClick={() => props.onSubmissionClick?.(event)}
      >
        submission
      </a>{' '}
      status to
      <span
        className={cn(
          'ml-1 inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
          labelStyle.bg,
          labelStyle.color,
        )}
      >
        {after}
      </span>
    </p>
  );
}
