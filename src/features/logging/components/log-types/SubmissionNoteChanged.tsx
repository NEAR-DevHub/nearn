import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function SubmissionNoteChanged(props: LogProperties) {
  const { event } = props;

  const data = event.data as EventDataMap[EventType.SUBMISSION_NOTE_CHANGED];
  const username = event.submission?.user.username;

  const positiveAction = (data.before ?? '').length > 0 ? 'Changed' : 'Added';
  const removed = (data.after ?? '').length === 0;

  return (
    <div className="flex flex-col gap-1">
      <p className="inline-flex items-center gap-1 text-slate-500">
        {!removed ? (
          <>
            {positiveAction} note to{' '}
            <a href={`/t/${username}`} className="text-slate-900">
              @{username}
            </a>{' '}
            submission:
          </>
        ) : (
          <>
            Removed note for{' '}
            <a href={`/t/${username}`} className="text-slate-900">
              @{username}
            </a>{' '}
            submission
          </>
        )}
      </p>

      {data.after && (
        <div className="whitespace-pre-wrap rounded-md bg-slate-50 px-2 py-1 text-slate-600">
          {data.after}
        </div>
      )}
    </div>
  );
}
