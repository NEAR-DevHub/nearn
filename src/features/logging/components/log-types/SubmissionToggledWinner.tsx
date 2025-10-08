import { nthLabelGenerator } from '@/utils/rank';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SubmissionToggledWinner(props: LogProperties) {
  const { event } = props;

  const data = event.data as EventDataMap[EventType.SUBMISSION_TOGGLED_WINNER];
  const username = event.submission?.user.username;
  const position = data.winnerPosition;

  const isAssigned =
    data.winnerPosition !== null && data.winnerPosition !== undefined;

  return (
    <p className="inline-flex items-center gap-1 text-slate-500">
      {isAssigned ? 'Assigned' : 'Unassigned'}{' '}
      <a href={`/t/${username}`} className="text-slate-900">
        @{username}
      </a>{' '}
      {isAssigned && (
        <span className="font-medium">{nthLabelGenerator(position!)}</span>
      )}{' '}
      place
    </p>
  );
}
