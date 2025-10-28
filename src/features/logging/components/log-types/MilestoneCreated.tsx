import { cn } from '@/utils/cn';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function MilestoneCreated(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.MILESTONE_CREATED];

  return (
    <p className="text-slate-500">
      {data?.useSingleMilestone ? (
        'Set payment type: Full payment'
      ) : (
        <>
          Set payment type: Milestone-based and status changed to{' '}
          <span
            className={cn(
              'ml-1 inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
              colorMap['InProgress'].bg,
              colorMap['InProgress'].color,
            )}
          >
            In Progress
          </span>
        </>
      )}
    </p>
  );
}
