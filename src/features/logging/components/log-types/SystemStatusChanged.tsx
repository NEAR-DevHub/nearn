import { cn } from '@/utils/cn';

import { getColorStyles } from '@/features/listings/utils/getColorStyles';

import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SystemStatusChanged(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.SYSTEM_STATUS_CHANGED];
  const listingStatus = getColorStyles(data.newStatus);

  return (
    <p className="text-slate-500">
      Changed{' '}
      {props.onListingClick ? (
        <button
          className="font-medium"
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
