"use client";

import { useState } from "react";
import type { EventFilters, EventRecord } from "@/lib/types";
import { filterEvents } from "@/lib/event-filters";
import { FilterBar } from "@/components/filter-bar";
import { FeaturedEvent } from "@/components/featured-event";
import { EventList } from "@/components/event-list";

const defaultFilters: EventFilters = {
  date: "upcoming",
  format: "all",
  kind: "all",
};

type Props = {
  events: EventRecord[];
};

export function EventFeed({ events }: Props) {
  const [filters, setFilters] = useState<EventFilters>(defaultFilters);

  const filtered = filterEvents(events, filters);
  const featured = filtered[0] ?? null;
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-muted/40 bg-background/75 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-10">
          <FilterBar value={filters} onChange={setFilters} />
        </div>
      </div>

      <main className="flex w-full min-w-0 flex-1 flex-col gap-16 pb-12 pt-12 sm:gap-24 sm:pt-16">
        {featured ? (
          <FeaturedEvent event={featured} />
        ) : (
          <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-12 text-center">
            <p className="font-display text-xl text-foreground">
              No upcoming events match
            </p>
            <p className="mt-3 text-sm leading-[1.7] text-foreground-muted">
              Try adjusting filters or check back &mdash; we pull fresh data
              from Luma every hour.
            </p>
          </div>
        )}

        {rest.length > 0 ? <EventList events={rest} /> : null}
      </main>
    </>
  );
}
