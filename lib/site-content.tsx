import type { ReactNode } from "react";

/** Canonical URLs and copy shared by UI + JSON-LD (keep in sync for FAQ rich results). */
export const SITE_URL = "https://aievents.sg" as const;
export const ORGANIZATION_NAME = "65labs" as const;
export const ORGANIZATION_URL = "https://65labs.org/" as const;

/** WebSite / meta description — factual blurb for crawlers and AI summaries. */
export const siteSummary =
  "Singapore AI meetups, hackathons, and workshops with links to each organizer's listing. Run by 65labs on aievents.sg—a dedicated calendar we keep separate from 65labs.org. We are not the venue and we do not sell tickets.";

export const siteIntroParagraphs: readonly ReactNode[] = [
  <>
    <strong className="font-semibold text-foreground">AI Events SG</strong>{" "}
    tracks AI events in Singapore: meetups, hackathons, workshops, the kind
    of thing you show up to if you build. We&apos;re not the venue or the box
    office, just a list.
  </>,
  <>
    We keep aievents.sg separate from{" "}
    <a
      href={ORGANIZATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline"
    >
      65labs.org
    </a>
    : that is our builder collective, events we run there, and the rest of how
    we show the work. This page is a wider, curated index of public Singapore
    AI listings. Details come from organizer pages (mostly Luma), refreshed
    about once an hour. Before you travel, double-check time and place on the
    host&apos;s page.
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
      "65labs. aievents.sg is a calendar we run on its own: curated public listings across Singapore's AI scene, separate from our main site at 65labs.org even though it is the same team. 65labs.org is home for the collective, events we run there, and the rest of our work; here we aggregate selected listings from the wider ecosystem. No single venue or sponsor pays to appear here.",
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
