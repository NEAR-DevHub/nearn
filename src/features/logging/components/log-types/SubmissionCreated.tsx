import { type LogProperties } from '.';

export default function SubmissionCreated({
  event,
  onSubmissionClick,
}: LogProperties) {
  return (
    <p className="inline-flex items-center gap-1 text-slate-500">
      Send{' '}
      <a className="font-medium" onClick={() => onSubmissionClick?.(event)}>
        submission
      </a>
    </p>
  );
}
