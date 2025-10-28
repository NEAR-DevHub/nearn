import { cn } from '@/utils/cn';
import { nthLabelGenerator } from '@/utils/rank';

import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import { type LogProperties } from '.';

export default function MilestoneApprove(props: LogProperties) {
  const { event } = props;
  const milestone = event.milestone;

  const labelStyle = colorMap['Approved'];
  const username = event.submission?.user?.username;

  return (
    <p className="items-center text-slate-500">
      <span className="text-slate-900">
        {milestone?.milestoneIndex &&
          nthLabelGenerator(milestone?.milestoneIndex, false)}
      </span>{' '}
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
          milestone
        </button>
      ) : (
        <span>milestone</span>
      )}{' '}
      has been
      <span
        className={cn(
          'ml-1 inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
          labelStyle.bg,
          labelStyle.color,
        )}
      >
        Approved
      </span>
    </p>
  );
}
