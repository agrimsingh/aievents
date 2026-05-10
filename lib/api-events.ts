import { EVENT_KIND_LABELS } from "@/lib/event-filters";
import type { EventKind, EventRecord } from "@/lib/types";

const API_VERSION = "1";
const SITE_SOURCE = "aievents.sg";
const SG_TZ = "Asia/Singapore";
const API_SORT = {
  field: "startAt",
  direction: "asc",
} as const;
const API_PAGINATION = {
  mode: "none",
  paginated: false,
} as const;
const API_SYNC = {
  mode: "complete_snapshot",
  removalPolicy: "missing_ids_are_removed",
  tombstones: false,
} as const;

type EventPlatform = "Luma" | "Meetup" | "Other";
type LocationVisibility =
  | "public"
  | "registration_required"
  | "virtual"
  | "unknown";
type EventStatusFilter = "upcoming" | "past" | "all";
type EventPublicationStatus = "published" | "cancelled" | "removed";

export type EventApiItem = {
  id: string;
  slug: string;
  name: string;
  type: string;
  typeId: EventKind;
  startAt: string;
  endAt: string | null;
  timezone: typeof SG_TZ;
  location: string;
  locationVisibility: LocationVisibility;
  hosts: Array<{
    name: string;
    avatar: string | null;
    url: string | null;
  }>;
  coverUrl: string | null;
  description: string;
  url: string;
  platform: EventPlatform;
  status: EventPublicationStatus;
  tags: string[];
  updatedAt: string;
};

export type EventApiResponse = {
  version: typeof API_VERSION;
  source: typeof SITE_SOURCE;
  timezone: typeof SG_TZ;
  updatedAt: string;
  count: number;
  sort: typeof API_SORT;
  pagination: typeof API_PAGINATION;
  sync: typeof API_SYNC;
  filters: {
    status: EventStatusFilter;
    type: string | null;
    platform: string | null;
    tag: string | null;
    q: string | null;
    from: string | null;
    to: string | null;
  };
  events: EventApiItem[];
};

export function buildEventsApiResponse(
  events: EventRecord[],
  searchParams: URLSearchParams,
): EventApiResponse {
  const updatedAt = new Date().toISOString();
  const filters = parseFilters(searchParams);
  const filtered = events
    .filter((event) => matchesStatus(event, filters.status))
    .filter((event) => matchesType(event, filters.type))
    .filter((event) => matchesPlatform(event, filters.platform))
    .filter((event) => matchesTag(event, filters.tag))
    .filter((event) => matchesQuery(event, filters.q))
    .filter((event) => matchesDateRange(event, filters.from, filters.to))
    .sort(compareEventsByStartAt);

  return {
    version: API_VERSION,
    source: SITE_SOURCE,
    timezone: SG_TZ,
    updatedAt,
    count: filtered.length,
    sort: API_SORT,
    pagination: API_PAGINATION,
    sync: API_SYNC,
    filters,
    events: filtered.map((event) => toApiEvent(event, updatedAt)),
  };
}

function parseFilters(
  searchParams: URLSearchParams,
): EventApiResponse["filters"] {
  const rawStatus = searchParams.get("status")?.toLowerCase();
  const status: EventStatusFilter =
    rawStatus === "past" || rawStatus === "all" ? rawStatus : "upcoming";

  return {
    status,
    type: normalizeFilter(searchParams.get("type")),
    platform: normalizeFilter(searchParams.get("platform")),
    tag: normalizeFilter(searchParams.get("tag")),
    q: normalizeFilter(searchParams.get("q")),
    from: normalizeFilter(searchParams.get("from")),
    to: normalizeFilter(searchParams.get("to")),
  };
}

function normalizeFilter(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toApiEvent(event: EventRecord, updatedAt: string): EventApiItem {
  return {
    id: event.slug,
    slug: event.slug,
    name: event.title,
    type: EVENT_KIND_LABELS[event.type],
    typeId: event.type,
    startAt: toIsoString(event.date),
    endAt: event.endDate ? toIsoString(event.endDate) : null,
    timezone: SG_TZ,
    location: formatLocation(event),
    locationVisibility: inferLocationVisibility(event),
    hosts: (event.hosts ?? []).map((host) => ({
      name: host.name,
      avatar: host.avatar ?? null,
      url: host.url ?? null,
    })),
    coverUrl: event.coverImage ?? null,
    description: event.description,
    url: event.sourceUrl,
    platform: inferPlatform(event.sourceUrl),
    status: "published",
    tags: event.tags ?? [],
    updatedAt,
  };
}

function toIsoString(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function compareEventsByStartAt(a: EventRecord, b: EventRecord): number {
  const startDiff = getEventStartTime(a) - getEventStartTime(b);
  if (startDiff !== 0) return startDiff;

  return a.title.localeCompare(b.title) || a.sourceUrl.localeCompare(b.sourceUrl);
}

function getEventStartTime(event: EventRecord): number {
  const startTime = new Date(event.date).getTime();
  return Number.isNaN(startTime) ? Number.POSITIVE_INFINITY : startTime;
}

function inferPlatform(sourceUrl: string): EventPlatform {
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase();
    if (host === "luma.com" || host.endsWith(".luma.com")) return "Luma";
    if (host === "lu.ma" || host.endsWith(".lu.ma")) return "Luma";
    if (host === "meetup.com" || host.endsWith(".meetup.com")) return "Meetup";
  } catch {
    return "Other";
  }
  return "Other";
}

function formatLocation(event: EventRecord): string {
  if (event.location.isVirtual) return "Online";

  const { name, address, city } = event.location;
  if (isRegistrationRequired(event)) {
    return "Register to see address";
  }
  if (address && name && name !== address && name !== city) {
    return `${name}, ${address}`;
  }
  if (address) return address;
  return name || city || "Singapore";
}

function inferLocationVisibility(event: EventRecord): LocationVisibility {
  if (event.location.isVirtual) return "virtual";
  const { name, address } = event.location;
  if (isRegistrationRequired(event)) return "registration_required";
  if (address || (name && name !== "Singapore")) return "public";
  return "unknown";
}

function isRegistrationRequired(event: EventRecord): boolean {
  const { name, address } = event.location;
  return (
    isRegistrationRequiredLocation(name) ||
    isRegistrationRequiredLocation(address) ||
    (inferPlatform(event.sourceUrl) === "Luma" && name === "Singapore" && !address)
  );
}

function isRegistrationRequiredLocation(value?: string): boolean {
  if (!value) return false;
  return (
    /register to see/i.test(value) ||
    /confirmed attendees/i.test(value) ||
    /shared with/i.test(value)
  );
}

function matchesStatus(event: EventRecord, status: EventStatusFilter): boolean {
  if (status === "all") return true;
  const now = Date.now();
  const relevantDate = new Date(event.endDate ?? event.date).getTime();
  if (Number.isNaN(relevantDate)) return true;
  return status === "upcoming" ? relevantDate >= now : relevantDate < now;
}

function matchesType(event: EventRecord, type: string | null): boolean {
  if (!type) return true;
  const normalized = type.toLowerCase();
  return (
    event.type.toLowerCase() === normalized ||
    EVENT_KIND_LABELS[event.type].toLowerCase() === normalized
  );
}

function matchesPlatform(event: EventRecord, platform: string | null): boolean {
  if (!platform) return true;
  return inferPlatform(event.sourceUrl).toLowerCase() === platform.toLowerCase();
}

function matchesTag(event: EventRecord, tag: string | null): boolean {
  if (!tag) return true;
  const normalized = tag.toLowerCase();
  return (event.tags ?? []).some(
    (eventTag) => eventTag.toLowerCase() === normalized,
  );
}

function matchesQuery(event: EventRecord, q: string | null): boolean {
  if (!q) return true;
  const haystack = [
    event.title,
    event.description,
    event.type,
    event.location.name,
    event.location.address,
    event.location.city,
    event.sourceUrl,
    ...(event.tags ?? []),
    ...(event.hosts ?? []).map((host) => host.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

function matchesDateRange(
  event: EventRecord,
  from: string | null,
  to: string | null,
): boolean {
  const eventStart = new Date(event.date).getTime();
  const eventEnd = new Date(event.endDate ?? event.date).getTime();
  if (Number.isNaN(eventStart) || Number.isNaN(eventEnd)) return true;

  const fromTime = parseDateBoundary(from, "start");
  const toTime = parseDateBoundary(to, "end");

  if (fromTime !== null && eventEnd < fromTime) return false;
  if (toTime !== null && eventStart > toTime) return false;
  return true;
}

function parseDateBoundary(
  value: string | null,
  boundary: "start" | "end",
): number | null {
  if (!value) return null;
  const dateText =
    /^\d{4}-\d{2}-\d{2}$/.test(value) && boundary === "start"
      ? `${value}T00:00:00.000+08:00`
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T23:59:59.999+08:00`
        : value;
  const timestamp = new Date(dateText).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}
