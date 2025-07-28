import { type LogProperties } from '.';

export default function SubmissionCreated({
  event,
  onSubmissionClick,
}: LogProperties) {
  return (
    <p className="inline-flex items-center gap-1 text-slate-500">
      Send{' '}
      <button
        className="font-medium"
        onClick={() => onSubmissionClick?.(event)}
      >
        submission
      </button>
    </p>
  );
}
