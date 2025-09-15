import { EventType } from '@/features/logging/types/event-data';

import { type LogProperties } from '.';

export function CommentPinnedUnpinned(props: LogProperties) {
  const { event } = props;
  const isPinned = event.eventType === EventType.COMMENT_PINNED;
  const comment = event.comment;
  const isInternalNotes = event.visibility === 'SPONSOR';
  const message = comment?.message;

  return (
    <div className="flex flex-col gap-1">
      <p className="items-center gap-1 text-slate-500">
        {isInternalNotes ? 'Note' : 'Comment'}{' '}
        {isPinned ? 'pinned' : 'unpinned'}
      </p>

      {message && (
        <div className="whitespace-pre-wrap break-all rounded-md bg-slate-50 px-2 py-1 text-slate-600">
          {message}
        </div>
      )}
    </div>
  );
}

export default function Comment(props: LogProperties) {
  const { event } = props;
  const isDeleted = event.eventType === EventType.COMMENT_DELETED;

  // Get comment data from the event
  const comment = event.comment;
  const message = comment?.message;
  const repliedToUsername = comment?.repliedTo?.author?.username;

  // Get submission and listing data
  const submissionUsername = event.submission?.user?.username;
  const isInternalNotes = event.visibility === 'SPONSOR';
  const commentText = isInternalNotes ? 'internal note' : 'comment';

  return (
    <div className="flex flex-col gap-1">
      <p className="items-center gap-1 text-slate-500">
        {/* Handle reply case */}
        {repliedToUsername && !isDeleted && (
          <>
            Replied to{' '}
            <a href={`/t/${repliedToUsername}`} className="text-slate-900">
              @{repliedToUsername}
            </a>{' '}
            {commentText}
          </>
        )}

        {/* Handle comment on submission */}
        {!repliedToUsername && submissionUsername && !isDeleted && (
          <>
            {isInternalNotes ? 'Added internal note to' : 'Commented on'}{' '}
            <a href={`/t/${submissionUsername}`} className="text-slate-900">
              @{submissionUsername}
            </a>{' '}
            {props.onSubmissionClick ? (
              <button
                className="text-slate-900"
                onClick={() => props.onSubmissionClick!(event)}
              >
                submission
              </button>
            ) : (
              <span>submission</span>
            )}
          </>
        )}

        {/* Handle comment on listing */}
        {!repliedToUsername && !submissionUsername && !isDeleted && (
          <>
            Commented on{' '}
            {props.onListingClick ? (
              <button
                className="text-slate-900"
                onClick={() => props.onListingClick!(event)}
              >
                listing
              </button>
            ) : (
              <span>listing</span>
            )}
          </>
        )}

        {/* Handle deleted comment */}
        {isDeleted && <>Deleted {commentText}</>}
      </p>

      {/* Show comment message for non-deleted comments */}
      {message && (
        <div className="whitespace-pre-wrap break-all rounded-md bg-slate-50 px-2 py-1 text-slate-600">
          {message}
        </div>
      )}
    </div>
  );
}
