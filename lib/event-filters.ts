import type { EventFilters, EventKind, EventRecord } from "@/lib/types";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const end = new Date(d);
  end.setDate(end.getDate() + diff);
  end.setHours(23, 59, 59, 999);
  return end;
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function filterEvents(
  events: EventRecord[],
  filters: EventFilters,
): EventRecord[] {
  const now = new Date();
  return events.filter((e) => {
    const eventDate = new Date(e.date);
    if (eventDate < startOfToday()) {
      return false;
    }
    if (filters.date === "week") {
      if (eventDate > endOfWeek(now)) return false;
    } else if (filters.date === "month") {
      if (eventDate > endOfMonth(now)) return false;
    }
    if (filters.format === "in-person" && e.location.isVirtual) {
      return false;
    }
    if (filters.format === "virtual" && !e.location.isVirtual) {
      return false;
    }
    if (filters.kind !== "all" && e.type !== filters.kind) {
      return false;
    }
    return true;
  });
}

export const EVENT_KIND_LABELS: Record<EventKind | "all", string> = {
  all: "All types",
  conference: "Conference",
  meetup: "Meetup",
  hackathon: "Hackathon",
  workshop: "Workshop",
  "demo-day": "Demo day",
  other: "Other",
};
