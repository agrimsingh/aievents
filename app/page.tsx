import type { Metadata } from "next";
import { getAllEvents } from "@/lib/luma";
import { buildHomeJsonLd } from "@/lib/json-ld";
import { SITE_URL, siteSummary } from "@/lib/site-content";
import { Hero } from "@/components/hero";
import { SiteIntro } from "@/components/site-intro";
import { SiteFaq } from "@/components/site-faq";
import { EventFeed } from "@/components/event-feed";
import { Footer } from "@/components/footer";

export const revalidate = 3600;

const homeTitle = "AI Events SG — Singapore AI hackathons, meetups & workshops";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: siteSummary,
  openGraph: {
    title: homeTitle,
    description: siteSummary,
    url: SITE_URL,
  },
  twitter: {
    title: homeTitle,
    description: siteSummary,
  },
};

export default async function Home() {
  const events = await getAllEvents();
  const jsonLd = buildHomeJsonLd(events);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <div className="flex min-h-full w-full min-w-0 flex-col">
        <Hero />
        <main
          id="main-content"
          className="flex min-w-0 flex-1 flex-col outline-none"
        >
          <SiteIntro />
          <EventFeed events={events} />
          <SiteFaq />
        </main>
        <Footer />
      </div>
    </>
  );
}
