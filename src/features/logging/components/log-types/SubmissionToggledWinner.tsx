import { nthLabelGenerator } from '@/utils/rank';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SubmissionToggledWinner(props: LogProperties) {
  const { event } = props;

  const data = event.data as EventDataMap[EventType.SUBMISSION_TOGGLED_WINNER];
  const username = event.submission?.user.username;
  const position = data.winnerPosition;

  const placeString = nthLabelGenerator(position ?? 1);

  return (
    <p className="inline-flex items-center gap-1 text-slate-500">
      Assigned{' '}
      <a href={`/t/${username}`} className="font-medium">
        @{username}
      </a>{' '}
      <span className="font-medium">{placeString}</span> place
    </p>
  );
}
