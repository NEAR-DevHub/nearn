import { type LogProperties } from '.';

export default function SubmissionCreated({ event }: LogProperties) {
  return (
    <p className="inline-flex items-center gap-1 text-slate-500">
      Send{' '}
      <a
        href={`/${event.sponsor?.slug}/${event.listing?.sequentialId}/${event.submission?.sequentialId}`}
        className="font-medium"
      >
        submission
      </a>
    </p>
  );
}
