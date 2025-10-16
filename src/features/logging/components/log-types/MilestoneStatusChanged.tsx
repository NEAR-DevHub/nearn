import { cn } from '@/utils/cn';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

const statusStyles: Record<string, { bg: string; color: string }> = {
  NotStarted: { bg: 'bg-gray-100', color: 'text-gray-700' },
  Pending: { bg: 'bg-blue-100', color: 'text-blue-700' },
  WorkCompleted: { bg: 'bg-purple-100', color: 'text-purple-700' },
  Approved: { bg: 'bg-green-100', color: 'text-green-700' },
  Rejected: { bg: 'bg-red-100', color: 'text-red-700' },
  Paid: { bg: 'bg-emerald-100', color: 'text-emerald-800' },
};

export default function MilestoneStatusChanged(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.MILESTONE_STATUS_UPDATED];
  const milestone = event.milestone;

  const oldStyle =
    statusStyles[data.previousStatus as keyof typeof statusStyles] ||
    statusStyles.NotStarted;
  const newStyle =
    statusStyles[data.newStatus as keyof typeof statusStyles] ||
    statusStyles.NotStarted;

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
        {data.previousStatus}
      </span>
      {' to '}
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-center text-sm font-medium',
          newStyle?.bg,
          newStyle?.color,
        )}
      >
        {data.newStatus}
      </span>
    </p>
  );
}
