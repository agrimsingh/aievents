import { cache } from "react";
import { curatedEvents, type CuratedEventEntry } from "@/data/events";
import { isLumaEventUrl } from "@/lib/event-link";
import type { EventKind, EventRecord } from "@/lib/types";

type PostalAddress = {
  streetAddress?: string;
  addressLocality?: string;
};

type JsonLdImageObject = { url?: string };

type SchemaEvent = {
  "@type"?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  image?: string | JsonLdImageObject | Array<string | JsonLdImageObject>;
  location?: {
    name?: string;
    address?: string | PostalAddress;
  };
  eventAttendanceMode?: string;
};

function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last ?? url.replace(/[^\w]+/g, "-");
  } catch {
    return url.replace(/[^\w]+/g, "-");
  }
}

function pickImage(image: SchemaEvent["image"]): string | undefined {
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
  return title;
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
      const data = JSON.parse(raw) as SchemaEvent | SchemaEvent[];
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Event" || item["@type"] === "SocialEvent") {
          return item;
        }
      }
    } catch {
      /* skip invalid JSON */
    }
  }
  return null;
}

export const fetchCuratedEvent = cache(
  async (entry: CuratedEventEntry): Promise<EventRecord | null> => {
    const { sourceUrl, type: typeOverride, tags } = entry;
    try {
      const res = await fetch(sourceUrl, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent":
            "AIEventsSG/1.0 (+https://aievents.sg; event aggregator)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) {
        console.error(`Event fetch failed ${res.status} for ${sourceUrl}`);
        return null;
      }
      const html = await res.text();
      const ev = extractJsonLdEvent(html);
      if (!ev?.name || !ev.startDate) {
        console.error(`No Event JSON-LD in ${sourceUrl}`);
        return null;
      }
      const slug = slugFromUrl(sourceUrl);
      const addr = parseAddress(ev.location);
      const virtual = isVirtualMode(ev.eventAttendanceMode);
      const cover = pickImage(ev.image);
      const title = normalizeEventTitle(sourceUrl, ev.name);

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
      };
    } catch (err) {
      console.error(`Event fetch error for ${sourceUrl}`, err);
      return null;
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
