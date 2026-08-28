import type { ReactNode } from "react";

/** Canonical URLs and copy shared by UI + JSON-LD (keep in sync for FAQ rich results). */
export const SITE_URL = "https://aievents.sg" as const;
export const ORGANIZATION_NAME = "65labs" as const;
export const ORGANIZATION_URL = "https://65labs.org/" as const;

/** WebSite / meta description — factual blurb for crawlers and AI summaries. */
export const siteSummary =
  "A list of AI meetups, hackathons, and workshops in Singapore. We link out. Check the host before you go. Run by 65labs.";

export const siteIntroParagraphs: readonly ReactNode[] = [
  <>
    AI events in Singapore you can show up to. Meetups, hackathons, workshops.
    We’re a list, not the box office. Times come from the organizer
    (usually Luma) about once an hour, so check their page before you leave.
    65labs runs this, separate from{" "}
    <a
      href={ORGANIZATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline"
    >
      65labs.org
    </a>
    .
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
    question: "What is this?",
    answer:
      "A list of public AI events in Singapore. We only link out. Tickets and last-minute changes live on the organizer’s page.",
  },
  {
    id: "who-runs",
    question: "Who runs it?",
    answer: "65labs. Same team as 65labs.org. Nobody pays to be listed.",
  },
  {
    id: "how-listed",
    question: "How do events get on here?",
    answer:
      "We watch public listings, usually Luma. Community sessions in or about Singapore. A lot of fine events never show up.",
  },
];
