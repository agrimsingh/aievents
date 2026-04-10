import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EventRecord } from "@/lib/types";
import { formatEventRange, formatDateParts } from "@/lib/format-date";
import { EVENT_KIND_LABELS } from "@/lib/event-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  event: EventRecord;
};

export function FeaturedEvent({ event }: Props) {
  const blurb = event.description.replace(/\s+/g, " ").trim();
  const locationLine = event.location.isVirtual
    ? "Online"
    : [event.location.name, event.location.city].filter(Boolean).join(" · ");
  const { day, month } = formatDateParts(event.date);

  return (
    <article className="animate-enter group w-full delay-4">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary sm:mb-8">
          Next up
        </p>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface shadow-[inset_0_0_0_1px_oklch(1_0_0/0.06)]">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt=""
                fill
                className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-foreground-muted">
                No cover
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{EVENT_KIND_LABELS[event.type]}</Badge>
              {event.tags?.slice(0, 2).map((t) => (
                <Badge key={t} variant="default">
                  {t}
                </Badge>
              ))}
            </div>

            <h2 className="mt-5 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.15] tracking-tight">
              {event.title}
            </h2>

            <div className="mt-5 flex items-center gap-2.5">
              <span className="font-display text-3xl font-semibold leading-none tabular-nums text-accent sm:text-4xl">
                {day}
              </span>
              <span className="text-base font-medium uppercase leading-none tracking-wider text-accent sm:text-lg">
                {month}
              </span>
            </div>

            <p className="mt-1 text-sm text-foreground-muted">
              {formatEventRange(event.date, event.endDate)}
            </p>
            <p className="mt-3 text-sm text-foreground-muted">{locationLine}</p>

            <p className="mt-5 max-w-[58ch] text-base leading-[1.7] text-foreground-muted line-clamp-3">
              {blurb.slice(0, 240)}
              {blurb.length > 240 ? "…" : ""}
            </p>

            <div className="mt-8">
              <Button asChild size="lg">
                <Link
                  href={event.lumaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  View on Luma
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
