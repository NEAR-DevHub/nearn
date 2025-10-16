import { cn } from '@/utils/cn';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function MilestoneApproveReject(props: LogProperties) {
  const { event } = props;
  const milestone = event.milestone;

  const status =
    event.eventType === EventType.MILESTONE_APPROVED ? 'Approved' : 'Rejected';

  const labelStyle = colorMap[status];
  const username = event.submission?.user?.username;

  return (
    <p className="items-center text-slate-500">
      Milestone {milestone?.milestoneIndex} -{' '}
      {milestone && (
        <>
          <span className="text-slate-900">{milestone.title}</span> for{' '}
        </>
      )}
      {username && (
        <>
          <a href={`/t/${username}`} className="text-slate-900">
            @{username}
          </a>{' '}
        </>
      )}
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
    </p>
  );
}
