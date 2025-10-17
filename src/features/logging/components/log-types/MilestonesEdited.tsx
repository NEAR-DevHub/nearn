import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function MilestonesEdited(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.MILESTONES_EDITED];
  const username = event.submission?.user?.username;

  const oldCount = data.oldMilestones.length;
  const newCount = data.newMilestones.length;

  const countChanged = oldCount !== newCount;
  const structureChanged =
    JSON.stringify(
      data.oldMilestones.map((m) => ({
        index: m.milestoneIndex,
        reward: m.reward,
      })),
    ) !==
    JSON.stringify(
      data.newMilestones.map((m) => ({
        index: m.milestoneIndex,
        reward: m.reward,
      })),
    );

  return (
    <div className="text-slate-500">
      <p>
        Updated milestone structure for{' '}
        {username ? (
          <a href={`/t/${username}`} className="text-slate-900">
            @{username}
          </a>
        ) : (
          <span>user</span>
        )}{' '}
        {props.onSubmissionClick ? (
          <button
            className="text-slate-900"
            onClick={() => props.onSubmissionClick!(event)}
          >
            submission
          </button>
        ) : (
          <span>submission</span>
        )}
      </p>

      {countChanged && (
        <p className="mt-1 text-sm">
          • Changed from <span className="text-slate-700">{oldCount}</span> to{' '}
          <span className="text-slate-700">{newCount}</span> milestone
          {newCount !== 1 ? 's' : ''}
        </p>
      )}

      {structureChanged && !countChanged && (
        <p className="mt-1 text-sm">
          • Redistributed rewards across milestones
        </p>
      )}
    </div>
  );
}
