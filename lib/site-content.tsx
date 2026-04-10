import type { ReactNode } from "react";

/** Canonical URLs and copy shared by UI + JSON-LD (keep in sync for FAQ rich results). */
export const SITE_URL = "https://aievents.sg" as const;
export const ORGANIZATION_NAME = "65labs" as const;
export const ORGANIZATION_URL = "https://65labs.org/" as const;

/** WebSite / meta description — factual blurb for crawlers and AI summaries. */
export const siteSummary =
  "Singapore AI meetups, hackathons, and workshops with links straight to each organizer's page. The 65labs.org team maintains the list. We don't host events or sell tickets.";

export const siteIntroParagraphs: readonly ReactNode[] = [
  <>
    <strong className="font-semibold text-foreground">AI Events SG</strong>{" "}
    tracks AI events in Singapore: meetups, hackathons, workshops, the kind
    of thing you show up to if you build. We are not the venue and we are not
    the box office, just a list.
  </>,
  <>
    The{" "}
    <a
      href={ORGANIZATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline"
    >
      65labs.org
    </a>{" "}
    crew keeps this going. We pull copy from public event pages (mostly Luma)
    and refresh about once an hour. Before you travel, double-check time and
    place on the host&apos;s page.
  </>,
];

export type FaqItem = {
  id: string;
  question: string;
  /** Plain text only — must match visible FAQ answers for FAQPage schema. */
  answer: string;
};

export const faqItems: readonly FaqItem[] = [
  {
    id: "what-is",
    question: "What is AI Events SG?",
    answer:
      "The aievents.sg site lists AI-related community events in Singapore: meetups, hackathons, workshops, the occasional demo day. We only link out. Registration and last-minute changes live on whatever page the organizer runs.",
  },
  {
    id: "who-runs",
    question: "Who runs AI Events SG?",
    answer:
      "The 65labs.org team, as a side project for builders here. 65labs is its own editorial thing; this calendar is not tied to one venue or sponsor.",
  },
  {
    id: "how-listed",
    question: "How do events get listed?",
    answer:
      "We add a public event URL (usually Luma) to the set we watch. We lean toward community, buildery sessions in or about Singapore. Plenty of perfectly fine events never show up here.",
  },
  {
    id: "organizer-role",
    question: "Is AI Events SG the event organizer?",
    answer:
      "No. We do not run the event, sell tickets, or sponsor what you see. If it is about admission, refunds, or the agenda, talk to the host on the official listing.",
  },
  {
    id: "freshness",
    question: "How often is the calendar updated?",
    answer:
      "We re-fetch source pages on a rough hourly cadence. If the door time moved this morning, trust the organizer's live page, not us.",
  },
];
