import { cache } from "react";
import { curatedEvents, type CuratedEventEntry } from "@/data/events";
import { isLumaEventUrl } from "@/lib/event-link";
import type { EventHost, EventKind, EventRecord } from "@/lib/types";

type PostalAddress = {
  streetAddress?: string;
  addressLocality?: string;
};

type JsonLdImage =
  | string
  | JsonLdImageObject
  | Array<string | JsonLdImageObject>;
type JsonLdImageObject = { url?: string };
type JsonLdNode = {
  "@graph"?: JsonLdNode[];
  "@id"?: string;
  "@type"?: string | string[];
  name?: string;
  url?: string;
  image?: JsonLdImage;
  logo?: string | JsonLdImageObject;
  address?: string | PostalAddress;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: JsonLdNode;
  eventAttendanceMode?: string;
  organizer?: JsonLdNode | JsonLdNode[];
};
type JsonLdOrganizer = JsonLdNode | JsonLdNode[];
type SchemaEvent = JsonLdNode;

function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last ?? url.replace(/[^\w]+/g, "-");
  } catch {
    return url.replace(/[^\w]+/g, "-");
  }
}

function pickImage(image: JsonLdImage | undefined): string | undefined {
  if (!image) return undefined;
  const first = Array.isArray(image) ? image[0] : image;
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && typeof first.url === "string") {
    return first.url;
  }
  return undefined;
}

function isVirtualMode(mode?: string): boolean {
  if (!mode) return false;
  return (
    mode.includes("Online") ||
    mode.includes("online") ||
    mode.includes("Virtual")
  );
}

function pickHosts(organizer: SchemaEvent["organizer"]): EventHost[] {
  if (!organizer) return [];
  const organizers = Array.isArray(organizer) ? organizer : [organizer];
  const seen = new Set<string>();
  return organizers
    .map((org) => {
      if (!org.name) return null;
      const key = org.name.trim().toLowerCase();
      if (seen.has(key)) return null;
      seen.add(key);
      const avatar = pickImage(org.image ?? org.logo);
      return {
        name: org.name,
        ...(avatar ? { avatar } : {}),
        ...(org.url ? { url: org.url } : {}),
      };
    })
    .filter((host): host is EventHost => host !== null);
}

function parseAddress(
  loc: SchemaEvent["location"],
): { name: string; address?: string; city: string } {
  if (!loc) {
    return { name: "Singapore", city: "Singapore" };
  }
  const name = loc.name ?? "Venue";
  if (typeof loc.address === "string") {
    return {
      name,
      address: loc.address,
      city: "Singapore",
    };
  }
  if (loc.address && typeof loc.address === "object") {
    const street = loc.address.streetAddress;
    const city = loc.address.addressLocality ?? "Singapore";
    return {
      name,
      address: street,
      city,
    };
  }
  return { name, city: "Singapore" };
}

function inferKind(title: string, override?: EventKind): EventKind {
  if (override) return override;
  const t = title.toLowerCase();
  if (t.includes("hackathon")) return "hackathon";
  if (t.includes("meetup")) return "meetup";
  if (t.includes("workshop")) return "workshop";
  if (t.includes("conference")) return "conference";
  if (t.includes("demo")) return "demo-day";
  return "other";
}

function normalizeEventTitle(sourceUrl: string, rawName: string): string {
  let title = rawName.trim();
  if (isLumaEventUrl(sourceUrl)) {
    title = title.replace(/\s*·\s*Luma\s*$/i, "").trim();
  }
  if (isGrowthXEventUrl(sourceUrl)) {
    title = title.replace(/\s*\|\s*GrowthX Events\s*$/i, "").trim();
  }
  return title;
}

function recordFromScrapeFallback(entry: CuratedEventEntry): EventRecord {
  const fb = entry.scrapeFallback!;
  const { sourceUrl, type: typeOverride, tags } = entry;
  const title = normalizeEventTitle(sourceUrl, fb.title);
  return {
    slug: slugFromUrl(sourceUrl),
    title,
    description: fb.description,
    date: fb.date,
    endDate: fb.endDate,
    location: fb.location,
    type: inferKind(title, typeOverride),
    coverImage: fb.coverImage,
    sourceUrl,
    tags,
    hosts: fb.hosts,
  };
}

/** Hoisted: same pattern used for every event HTML parse (js-hoist-regexp). */
const JSON_LD_SCRIPT_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function extractJsonLdEvent(html: string): SchemaEvent | null {
  JSON_LD_SCRIPT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = JSON_LD_SCRIPT_RE.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      const nodes = collectJsonLdNodes(JSON.parse(raw));
      for (const node of nodes) {
        if (isJsonLdEvent(node)) {
          return resolveJsonLdReferences(node, nodes);
        }
      }
    } catch {
      /* skip invalid JSON */
    }
  }
  return null;
}

function collectJsonLdNodes(data: unknown): JsonLdNode[] {
  const items = Array.isArray(data) ? data : [data];
  return items.flatMap((item) => {
    if (!isJsonLdNode(item)) return [];
    return [
      item,
      ...(Array.isArray(item["@graph"])
        ? item["@graph"].filter(isJsonLdNode)
        : []),
    ];
  });
}

function isJsonLdNode(value: unknown): value is JsonLdNode {
  return typeof value === "object" && value !== null;
}

function isJsonLdEvent(node: JsonLdNode): boolean {
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  return types.includes("Event") || types.includes("SocialEvent");
}

function resolveJsonLdReferences(
  event: SchemaEvent,
  nodes: JsonLdNode[],
): SchemaEvent {
  const nodesById = new Map(
    nodes
      .filter((node): node is JsonLdNode & { "@id": string } => !!node["@id"])
      .map((node) => [node["@id"], node]),
  );

  return {
    ...event,
    location: resolveJsonLdReference(event.location, nodesById),
    organizer: resolveJsonLdOrganizer(event.organizer, nodesById),
  };
}

function resolveJsonLdReference(
  node: JsonLdNode | undefined,
  nodesById: Map<string, JsonLdNode>,
): JsonLdNode | undefined {
  if (!node?.["@id"]) return node;
  const resolved = nodesById.get(node["@id"]);
  if (!resolved || resolved === node) return node;
  return { ...resolved, ...node };
}

function resolveJsonLdOrganizer(
  organizer: JsonLdOrganizer | undefined,
  nodesById: Map<string, JsonLdNode>,
): JsonLdOrganizer | undefined {
  if (!organizer) return undefined;
  if (Array.isArray(organizer)) {
    return organizer.map((org) => resolveJsonLdReference(org, nodesById) ?? org);
  }
  return resolveJsonLdReference(organizer, nodesById);
}

function isGrowthXEventUrl(sourceUrl: string): boolean {
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase();
    return host === "growthx.club" || host.endsWith(".growthx.club");
  } catch {
    return false;
  }
}

export const fetchCuratedEvent = cache(
  async (entry: CuratedEventEntry): Promise<EventRecord | null> => {
    const { sourceUrl, type: typeOverride, tags } = entry;
    try {
      const res = await fetch(sourceUrl, {
        next: { revalidate: 3600 },
        headers: {
          // Browser-like UA: some hosts return a bot interstitial to datacenter fetches.
          "User-Agent":
            "Mozilla/5.0 (compatible; AIEventsSG/1.0; +https://aievents.sg) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-SG,en;q=0.9",
        },
      });
      if (!res.ok) {
        console.error(`Event fetch failed ${res.status} for ${sourceUrl}`);
        return entry.scrapeFallback ? recordFromScrapeFallback(entry) : null;
      }
      const html = await res.text();
      const ev = extractJsonLdEvent(html);
      if (!ev?.name || !ev.startDate) {
        console.error(`No Event JSON-LD in ${sourceUrl}`);
        return entry.scrapeFallback ? recordFromScrapeFallback(entry) : null;
      }
      const slug = slugFromUrl(sourceUrl);
      const addr = parseAddress(ev.location);
      const virtual = isVirtualMode(ev.eventAttendanceMode);
      const cover = pickImage(ev.image);
      const title = normalizeEventTitle(sourceUrl, ev.name);
      const hosts = pickHosts(ev.organizer);

      return {
        slug,
        title,
        description: ev.description ?? "",
        date: ev.startDate,
        endDate: ev.endDate,
        location: {
          name: addr.name,
          address: addr.address,
          city: addr.city,
          isVirtual: virtual,
        },
        type: inferKind(title, typeOverride),
        coverImage: cover,
        sourceUrl,
        tags,
        hosts,
      };
    } catch (err) {
      console.error(`Event fetch error for ${sourceUrl}`, err);
      return entry.scrapeFallback ? recordFromScrapeFallback(entry) : null;
    }
  },
);

/** Per-request dedupe if multiple server components need the list (server-cache-react). */
export const getAllEvents = cache(async (): Promise<EventRecord[]> => {
  const results = await Promise.all(
    curatedEvents.map((e) => fetchCuratedEvent(e)),
  );
  return results.filter((r): r is EventRecord => r !== null).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
});
