import { type EventType } from '../types/event-data';
import LOG_IMPLEMENTATION_MAPPING, { type LogProperties } from './log-types';
import User from './User';

interface Properties extends LogProperties {
  sponsorGlobalView?: boolean;
}

export default function Log({ event, sponsorGlobalView = false }: Properties) {
  const Component = LOG_IMPLEMENTATION_MAPPING[event.eventType as EventType];

  return (
    <div className="flex flex-col gap-1">
      <User event={event} globalView={sponsorGlobalView} />
      {Component && <Component event={event} />}
    </div>
  );
}
