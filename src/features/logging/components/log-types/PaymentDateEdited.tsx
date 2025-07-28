import dayjs from 'dayjs';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function ListingEdit({
  event,
  onSubmissionClick,
}: LogProperties) {
  const { before, after } =
    event.data as unknown as EventDataMap[EventType.SUBMISSION_PAYMENT_DATE_EDITED];

  const formatDate = (date: Date | null) => {
    if (!date) return 'No date';
    return dayjs(date).format('MMM D, YYYY');
  };

  const oldDate = formatDate(before);
  const newDate = formatDate(after);

  return (
    <p className="text-slate-500">
      Changed{' '}
      <a className="font-medium" onClick={() => onSubmissionClick?.(event)}>
        submission
      </a>{' '}
      payout date from {oldDate} to{' '}
      <span className="font-medium">{newDate}</span>
    </p>
  );
}
