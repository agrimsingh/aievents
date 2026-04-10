import type { EventRecord } from "@/lib/types";
import { EventEntry } from "@/components/event-entry";

type Props = {
  events: EventRecord[];
};

export function EventList({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12 text-center sm:px-6 lg:px-10">
        <p className="font-display text-xl text-foreground">
          Nothing matches those filters
        </p>
        <p className="mt-2 text-sm leading-[1.7] text-foreground-muted">
          Try widening the window or switching type &mdash; new events land here
          as they&apos;re added to Luma.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-6 lg:px-10">
      <h2 className="mb-2 font-display text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold tracking-tight">
        More coming up
      </h2>
      <ul className="w-full list-none divide-y divide-muted/50 p-0">
        {events.map((e) => (
          <li key={e.slug} className="w-full min-w-0">
            <EventEntry event={e} />
          </li>
        ))}
      </ul>
    </div>
  );
}
