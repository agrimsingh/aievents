import type { EventKind } from "@/lib/types";

/** Curated Luma URLs + optional overrides (type inferred if omitted). */
export type CuratedLumaEntry = {
  lumaUrl: string;
  type?: EventKind;
  tags?: string[];
};

export const curatedLumaEvents: CuratedLumaEntry[] = [
  {
    lumaUrl: "https://luma.com/srcfgry1",
    type: "hackathon",
    tags: ["Grab", "65labs", "API"],
  },
  {
    lumaUrl: "https://luma.com/fhdzsqfd",
    type: "meetup",
    tags: ["Codex", "agents"],
  },
  {
    lumaUrl: "https://luma.com/bh5iqhnx",
  },
];
