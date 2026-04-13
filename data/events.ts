import type { EventKind } from "@/lib/types";

/** Curated event page URLs (Luma or other hosts with Event JSON-LD). */
export type CuratedEventEntry = {
  sourceUrl: string;
  type?: EventKind;
  tags?: string[];
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
  },
];
