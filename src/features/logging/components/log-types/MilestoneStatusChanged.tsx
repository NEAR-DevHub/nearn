import { cn } from '@/utils/cn';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function MilestoneStatusChanged(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.MILESTONE_STATUS_UPDATED];
  const milestone = event.milestone;

  const oldStyle =
    colorMap[data.previousStatus as keyof typeof colorMap] ||
    colorMap.NotStarted;
  const newStyle =
    colorMap[data.newStatus as keyof typeof colorMap] || colorMap.NotStarted;

  return (
    <p className="text-slate-500">
      Changed milestone{' '}
      {milestone && (
        <>
          <span className="text-slate-900">{milestone.title}</span>{' '}
        </>
      )}
      status from{' '}
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-center text-sm font-medium',
          oldStyle?.bg,
          oldStyle?.color,
        )}
      >
        {data.previousStatus.replace(/([A-Z])/g, ' $1').trim()}
      </span>
      {' to '}
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-center text-sm font-medium',
          newStyle?.bg,
          newStyle?.color,
        )}
      >
        {data.newStatus.replace(/([A-Z])/g, ' $1').trim()}
      </span>
    </p>
  );
}
