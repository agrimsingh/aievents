export type EventKind =
  | "conference"
  | "meetup"
  | "hackathon"
  | "workshop"
  | "demo-day"
  | "other";

export type EventRecord = {
  slug: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: {
    name: string;
    address?: string;
    city: string;
    isVirtual: boolean;
  };
  type: EventKind;
  coverImage?: string;
  /** Canonical event page (Luma or any host with Event JSON-LD). */
  sourceUrl: string;
  tags?: string[];
};

export type DateFilter = "upcoming" | "week" | "month";
export type FormatFilter = "all" | "in-person" | "virtual";
export type EventFilters = {
  date: DateFilter;
  format: FormatFilter;
  kind: EventKind | "all";
};
