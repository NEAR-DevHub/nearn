import { type EventType } from '../types/event-data';
import LOG_IMPLEMENTATION_MAPPING, { type LogProperties } from './log-types';
import User from './User';

export default function Log({ event }: LogProperties) {
  const Component = LOG_IMPLEMENTATION_MAPPING[event.eventType as EventType];

  // if (!Component) {
  //   return null;
  // }

  return (
    <div className="flex flex-col gap-1">
      <User event={event} />
      {Component && <Component event={event} />}
    </div>
  );
}
