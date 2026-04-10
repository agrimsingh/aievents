import { getAllEvents } from "@/lib/luma";
import { buildEventsJsonLd } from "@/lib/json-ld";
import { Hero } from "@/components/hero";
import { EventFeed } from "@/components/event-feed";
import { Footer } from "@/components/footer";

export const revalidate = 3600;

export default async function Home() {
  const events = await getAllEvents();
  const jsonLd = buildEventsJsonLd(events);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <div className="flex min-h-full flex-col">
        <Hero />
        <EventFeed events={events} />
        <Footer />
      </div>
    </>
  );
}
