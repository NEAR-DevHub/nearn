import { type EventType } from '../types/event-data';
import LOG_IMPLEMENTATION_MAPPING, { type LogProperties } from './log-types';
import User from './User';

interface Properties extends LogProperties {
  showExtraInfo?: 'listing' | 'submission' | 'both';
  hideActorRole?: boolean;
}

export default function Log({
  event,
  showExtraInfo,
  onListingClick,
  onSubmissionClick,
}: Properties) {
  const Component = LOG_IMPLEMENTATION_MAPPING[event.eventType as EventType];

  return (
    <div className="flex flex-col gap-1">
      <User
        event={event}
        showExtraInfo={showExtraInfo}
        onListingClick={onListingClick}
        onSubmissionClick={onSubmissionClick}
      />
      {Component && (
        <Component
          event={event}
          onListingClick={onListingClick}
          onSubmissionClick={onSubmissionClick}
        />
      )}
    </div>
  );
}
