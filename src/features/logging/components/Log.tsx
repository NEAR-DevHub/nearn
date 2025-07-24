import { type EventType } from '../types/event-data';
import LOG_IMPLEMENTATION_MAPPING, { type LogProperties } from './log-types';
import User from './User';

interface Properties extends LogProperties {
  showExtraInfo?: 'listing' | 'submission' | 'both';
  hideActorRole?: boolean;
}

export default function Log({ event, showExtraInfo }: Properties) {
  const Component = LOG_IMPLEMENTATION_MAPPING[event.eventType as EventType];

  return (
    <div className="flex flex-col gap-1">
      <User event={event} showExtraInfo={showExtraInfo} />
      {Component && <Component event={event} />}
    </div>
  );
}
