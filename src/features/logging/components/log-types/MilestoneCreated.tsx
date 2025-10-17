import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function MilestoneCreated(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.MILESTONE_CREATED];
  const username = event.submission?.user?.username;

  const totalReward = data.rewardDistribution.reduce(
    (sum, m) => sum + m.reward,
    0,
  );
  const count = data.rewardDistribution.length;

  return (
    <p className="text-slate-500">
      Created{' '}
      <span className="text-slate-900">
        {count} milestone{count > 1 ? 's' : ''}
      </span>
      {' with total reward '}
      <span className="text-slate-900">{totalReward.toLocaleString()}</span>
      {' for '}
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
  );
}
