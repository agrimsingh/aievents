import type { ReactNode } from "react";

/** Canonical URLs and copy shared by UI + JSON-LD. */
export const SITE_URL = "https://aievents.sg" as const;
export const ORGANIZATION_NAME = "65labs" as const;
export const ORGANIZATION_URL = "https://65labs.org/" as const;

/** WebSite / meta description — factual blurb for crawlers and AI summaries. */
export const siteSummary =
  "AI events in Singapore. Meetups, hackathons, workshops.";

export const siteIntroParagraphs: readonly ReactNode[] = [
  "AI events in Singapore. A list from 65labs and friends.",
];

export type FaqItem = {
  id: string;
  question: string;
  /** Plain text only — must match visible FAQ answers for FAQPage schema. */
  answer: string;
};

export const faqItems: readonly FaqItem[] = [];
