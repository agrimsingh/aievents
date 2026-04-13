import type { EventKind, EventRecord } from "@/lib/types";

/** Snapshot when server-side fetch cannot read the page (e.g. bot interstitial). */
export type CuratedEventFallback = Pick<
  EventRecord,
  "title" | "description" | "date" | "location"
> &
  Pick<Partial<EventRecord>, "endDate" | "coverImage">;

/** Curated event page URLs (Luma or other hosts with Event JSON-LD). */
export type CuratedEventEntry = {
  sourceUrl: string;
  type?: EventKind;
  tags?: string[];
  scrapeFallback?: CuratedEventFallback;
};

export const curatedEvents: CuratedEventEntry[] = [
  {
    sourceUrl: "https://luma.com/srcfgry1",
    type: "hackathon",
    tags: ["Grab", "65labs", "API"],
  },
  {
    sourceUrl: "https://luma.com/fhdzsqfd",
    type: "meetup",
    tags: ["Codex", "agents"],
  },
  {
    sourceUrl: "https://luma.com/bh5iqhnx",
    type: "hackathon",
    tags: ["Vercel"],
  },
  {
    sourceUrl:
      "https://singapore.aitinkerers.org/p/ai-tinkerers-singapore-the-agentic-future-dev-eng-workflows",
    type: "meetup",
    tags: ["AI Tinkerers", "agents"],
    scrapeFallback: {
      title:
        "AI Tinkerers Singapore: The Agentic Future & Dev/Eng Workflows",
      description:
        "The Agentic Future & Dev/Eng Workflows As the frontier of AI shifts from simple chat interfaces to autonomous agents, the engineering challenges move to orchestration, reliability, and local execution efficiency. Join AI Tinkerers Singapore for an evening dedicated to the builders ...",
      date: "2026-04-21T10:00:00Z",
      endDate: "2026-04-21T13:00:00Z",
      location: {
        name: "Location shared with confirmed attendees only.",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://sloppy-joe-app.imgix.net/blog_images/iney3owf5fq-jpg-H4dR.jpg?fm=jpg",
    },
  },
];
