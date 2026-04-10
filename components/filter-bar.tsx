"use client";

import type { EventFilters } from "@/lib/types";
import { EVENT_KIND_LABELS } from "@/lib/event-filters";
import { cn } from "@/lib/utils";

type Props = {
  value: EventFilters;
  onChange: (next: EventFilters) => void;
  className?: string;
};

const dateOptions: { id: EventFilters["date"]; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const formatOptions: { id: EventFilters["format"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in-person", label: "In person" },
  { id: "virtual", label: "Virtual" },
];

const kindOrder = [
  "all",
  "meetup",
  "hackathon",
  "workshop",
  "conference",
  "demo-day",
  "other",
] as const;

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-[color,background-color,box-shadow] duration-200 ease-out",
        active
          ? "bg-accent text-accent-contrast"
          : "text-foreground-muted shadow-[inset_0_0_0_1px_var(--muted)] hover:text-foreground hover:shadow-[inset_0_0_0_1px_var(--fg-muted)]",
      )}
    >
      {children}
    </button>
  );
}

export function FilterBar({ value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "animate-enter flex flex-col gap-5 delay-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5" role="group" aria-label="When">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-foreground-muted">
          When
        </span>
        <div className="flex flex-wrap gap-1.5">
          {dateOptions.map((opt) => (
            <Pill
              key={opt.id}
              active={value.date === opt.id}
              onClick={() => onChange({ ...value, date: opt.id })}
            >
              {opt.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5" role="group" aria-label="Format">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-foreground-muted">
          Format
        </span>
        <div className="flex flex-wrap gap-1.5">
          {formatOptions.map((opt) => (
            <Pill
              key={opt.id}
              active={value.format === opt.id}
              onClick={() => onChange({ ...value, format: opt.id })}
            >
              {opt.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex min-w-[10rem] flex-col gap-1.5 sm:ml-auto">
        <label
          htmlFor="event-kind"
          className="text-[10px] font-medium uppercase tracking-[0.15em] text-foreground-muted"
        >
          Type
        </label>
        <select
          id="event-kind"
          value={value.kind}
          onChange={(e) =>
            onChange({
              ...value,
              kind: e.target.value as EventFilters["kind"],
            })
          }
          className="h-9 w-full rounded-lg bg-transparent px-2 text-[0.8125rem] text-foreground shadow-[inset_0_0_0_1px_var(--muted)] outline-none transition-[box-shadow] duration-200 focus:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_3px_var(--ring)]"
        >
          {kindOrder.map((k) => (
            <option key={k} value={k}>
              {EVENT_KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
