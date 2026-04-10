import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EventRecord } from "@/lib/types";
import { formatDateParts } from "@/lib/format-date";
import { EVENT_KIND_LABELS } from "@/lib/event-filters";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  event: EventRecord;
  className?: string;
};

export function EventEntry({ event, className }: Props) {
  const locationLine = event.location.isVirtual
    ? "Online"
    : [event.location.name, event.location.city].filter(Boolean).join(" · ");
  const { day, month } = formatDateParts(event.date);

  return (
    <article
      className={cn(
        "group grid grid-cols-[3.25rem_1fr_auto] items-start gap-4 py-5 transition-[background-color,opacity] duration-200 ease-out sm:grid-cols-[3.25rem_5.5rem_1fr_auto] sm:gap-5",
        className,
      )}
    >
      {/* Date block — always visible, display font for scanability */}
      <div className="flex flex-col items-center pt-0.5 text-center">
        <span className="font-display text-2xl font-semibold leading-none tabular-nums text-foreground">
          {day}
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-foreground-muted">
          {month}
        </span>
      </div>

      {/* Thumbnail — hidden on mobile */}
      <div className="hidden sm:block">
        {event.coverImage ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface shadow-[inset_0_0_0_1px_oklch(1_0_0/0.06)]">
            <Image
              src={event.coverImage}
              alt=""
              fill
              className="object-cover transition duration-300 ease-out group-hover:scale-[1.04]"
              sizes="88px"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-surface text-[10px] text-foreground-muted shadow-[inset_0_0_0_1px_oklch(1_0_0/0.06)]">
            —
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Badge variant="kind" className="text-[10px]">
            {EVENT_KIND_LABELS[event.type]}
          </Badge>
        </div>
        <h3 className="font-display text-[1.05rem] font-semibold leading-snug sm:text-lg">
          <Link
            href={event.lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 text-[0.8125rem] text-foreground-muted">
          {locationLine}
        </p>
      </div>

      {/* CTA */}
      <div className="flex shrink-0 items-start pt-1">
        <Link
          href={event.lumaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted shadow-[inset_0_0_0_1px_var(--muted)] transition-[color,box-shadow] duration-200 group-hover:text-accent group-hover:shadow-[inset_0_0_0_1px_var(--accent)]"
        >
          Luma
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
