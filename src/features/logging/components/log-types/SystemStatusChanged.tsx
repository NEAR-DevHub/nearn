import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SystemStatusChanged(props: LogProperties) {
  const { event } = props;
  const data = event.data as EventDataMap[EventType.SYSTEM_STATUS_CHANGED];

  return (
    <p className="text-slate-500">
      Changed status to <span className="font-medium">[{data.newStatus}]</span>
    </p>
  );
}
