import { type EventLog } from '@prisma/client';

import { type EventType } from '../types/event-data';
import LOG_IMPLEMENTATION_MAPPING from './log-types';
import User from './User';

interface Properties {
  event: EventLog;
}

export default function Log({ event }: Properties) {
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
