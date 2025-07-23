import { type LogProperties } from '.';

export default function PublishListing(props: LogProperties) {
  return (
    <p className="inline-flex flex-wrap items-center gap-1 text-slate-500">
      Published {props.event.listing?.type} listing and automatically updated
      status to
      <span className="w-fit rounded-xl bg-violet-100 px-3 py-0.5 text-violet-500">
        In Progress
      </span>
    </p>
  );
}
