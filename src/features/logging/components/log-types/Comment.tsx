import { EventType } from '@/features/logging/types/event-data';

import { type LogProperties } from '.';

export default function Comment(props: LogProperties) {
  const { event } = props;
  const isDeleted = event.eventType === EventType.COMMENT_DELETED;

  // Get comment data from the event
  const comment = event.comment;
  const message = comment?.message;
  const repliedToUsername = comment?.repliedTo?.author?.username;

  // Get submission and listing data
  const submissionUsername = event.submission?.user?.username;

  return (
    <div className="flex flex-col gap-1">
      <p className="inline-flex items-center gap-1 text-slate-500">
        {/* Handle reply case */}
        {repliedToUsername && !isDeleted && (
          <>
            Replied to{' '}
            <a href={`/t/${repliedToUsername}`} className="font-medium">
              @{repliedToUsername}
            </a>{' '}
            comment
          </>
        )}

        {/* Handle comment on submission */}
        {!repliedToUsername && submissionUsername && !isDeleted && (
          <>
            Commented on{' '}
            <a href={`/t/${submissionUsername}`} className="font-medium">
              @{submissionUsername}
            </a>{' '}
            <button
              className="font-medium"
              onClick={() => props.onSubmissionClick?.(event)}
            >
              submission
            </button>
          </>
        )}

        {/* Handle comment on listing */}
        {!repliedToUsername && !submissionUsername && !isDeleted && (
          <>
            Commented on{' '}
            <button
              className="font-medium"
              onClick={() => props.onListingClick?.(event)}
            >
              listing
            </button>
          </>
        )}

        {/* Handle deleted comment */}
        {isDeleted && <>Deleted comment</>}
      </p>

      {/* Show comment message for non-deleted comments */}
      {message && (
        <div className="whitespace-pre-wrap rounded-md bg-slate-50 px-2 py-1 text-slate-600">
          {message}
        </div>
      )}
    </div>
  );
}
