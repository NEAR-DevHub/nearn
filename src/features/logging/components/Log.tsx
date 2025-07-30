import { type EventType } from '../types/event-data';
import LOG_IMPLEMENTATION_MAPPING, { type LogProperties } from './log-types';
import LogUser from './LogUser';

interface Properties extends LogProperties {
  showExtraInfo?: 'listing' | 'submission' | 'both';
  hideActorRole?: boolean;
}

export default function Log({
  event,
  showExtraInfo,
  hideActorRole,
  onListingClick,
  onSubmissionClick,
}: Properties) {
  const Component = LOG_IMPLEMENTATION_MAPPING[event.eventType as EventType];

  return (
    <div className="flex flex-col gap-1">
      <LogUser
        event={event}
        showExtraInfo={showExtraInfo}
        hideActorRole={hideActorRole}
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
