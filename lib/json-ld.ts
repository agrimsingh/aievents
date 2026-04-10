import type { EventRecord } from "@/lib/types";

export function buildEventsJsonLd(events: EventRecord[]) {
  return {
    "@context": "https://schema.org",
    "@graph": events.map((e) => {
      const place =
        e.location.isVirtual || !e.location.name
          ? undefined
          : {
              "@type": "Place" as const,
              name: e.location.name,
              address: e.location.address
                ? {
                    "@type": "PostalAddress" as const,
                    streetAddress: e.location.address,
                    addressLocality: e.location.city,
                    addressCountry: "SG",
                  }
                : {
                    "@type": "PostalAddress" as const,
                    addressLocality: e.location.city,
                    addressCountry: "SG",
                  },
            };
      return {
        "@type": "Event",
        "@id": e.lumaUrl,
        name: e.title,
        description: e.description,
        startDate: e.date,
        endDate: e.endDate,
        url: e.lumaUrl,
        image: e.coverImage,
        eventAttendanceMode: e.location.isVirtual
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
        location: place,
      };
    }),
  };
}
