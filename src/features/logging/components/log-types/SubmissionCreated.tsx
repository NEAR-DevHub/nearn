import { type LogProperties } from '.';

export default function SubmissionCreated({
  event,
  onSubmissionClick,
}: LogProperties) {
  return (
    <p className="inline-flex items-center gap-1 text-slate-500">
      Send{' '}
      {onSubmissionClick ? (
        <button
          className="text-slate-900"
          onClick={() => onSubmissionClick(event)}
        >
          submission
        </button>
      ) : (
        <span>submission</span>
      )}
    </p>
  );
}
