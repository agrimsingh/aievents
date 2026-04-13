import type { EventRecord } from "@/lib/types";
import {
  ORGANIZATION_NAME,
  ORGANIZATION_URL,
  SITE_URL,
  faqItems,
  siteSummary,
} from "@/lib/site-content";

const ORG_ID = `${ORGANIZATION_URL}#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const FAQ_ID = `${SITE_URL}/#faq`;
const LIST_ID = `${SITE_URL}/#eventlist`;

function eventToJsonLd(e: EventRecord) {
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
    "@type": "Event" as const,
    "@id": e.sourceUrl,
    name: e.title,
    description: e.description,
    startDate: e.date,
    endDate: e.endDate,
    url: e.sourceUrl,
    image: e.coverImage,
    eventAttendanceMode: e.location.isVirtual
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: place,
    organizer: {
      "@type": "Organization" as const,
      "@id": ORG_ID,
    },
  };
}

export function buildHomeJsonLd(events: EventRecord[]) {
  const organization = {
    "@type": "Organization" as const,
    "@id": ORG_ID,
    name: ORGANIZATION_NAME,
    url: ORGANIZATION_URL,
    logo: {
      "@type": "ImageObject" as const,
      url: `${SITE_URL}/65labs.png`,
    },
  };

  const website = {
    "@type": "WebSite" as const,
    "@id": SITE_ID,
    url: SITE_URL,
    name: "AI Events SG",
    description: siteSummary,
    inLanguage: "en-SG",
    publisher: { "@id": ORG_ID },
  };

  const itemList = {
    "@type": "ItemList" as const,
    "@id": LIST_ID,
    name: "Upcoming AI community events in Singapore",
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: e.title,
      url: e.sourceUrl,
    })),
  };

  const faqPage = {
    "@type": "FAQPage" as const,
    "@id": FAQ_ID,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      website,
      itemList,
      faqPage,
      ...events.map(eventToJsonLd),
    ],
  };
}

