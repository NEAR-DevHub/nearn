import { cn } from '@/utils/cn';

import { getColorStyles } from '@/features/listings/utils/getColorStyles';

import { type EventDataMap, EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SystemStatusChanged(props: LogProperties) {
  const { event } = props;
  const data =
    event.eventType === EventType.SYSTEM_STATUS_IN_REVIEW
      ? { newStatus: 'In Review', oldStatus: 'In Progress' }
      : (event.data as EventDataMap[EventType.SYSTEM_STATUS_CHANGED]);
  const listingStatus = getColorStyles(data.newStatus);

  return (
    <p className="text-slate-500">
      Changed{' '}
      {props.onListingClick ? (
        <button
          className="text-slate-900"
          onClick={() => props.onListingClick?.(event)}
        >
          listing
        </button>
      ) : (
        <span>listing</span>
      )}{' '}
      status to{' '}
      <span
        className={cn(
          'inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
          listingStatus.color,
          listingStatus.bgColor,
        )}
      >
        {data.newStatus}
      </span>
    </p>
  );
}
