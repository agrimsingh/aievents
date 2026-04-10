const SG_TZ = "Asia/Singapore";

export function formatEventRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso);
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: SG_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  };
  const startStr = new Intl.DateTimeFormat("en-SG", opts).format(start);
  if (!endIso) return startStr;
  const end = new Date(endIso);
  const sameDay =
    start.toDateString() === end.toDateString() ||
    (start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate());
  if (sameDay) {
    const endTime = new Intl.DateTimeFormat("en-SG", {
      timeZone: SG_TZ,
      hour: "numeric",
      minute: "2-digit",
    }).format(end);
    return `${startStr} – ${endTime}`;
  }
  const endStr = new Intl.DateTimeFormat("en-SG", opts).format(end);
  return `${startStr} → ${endStr}`;
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    timeZone: SG_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function formatDateParts(iso: string): {
  day: string;
  month: string;
  weekday: string;
} {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-SG", {
    timeZone: SG_TZ,
    day: "numeric",
  }).format(d);
  const month = new Intl.DateTimeFormat("en-SG", {
    timeZone: SG_TZ,
    month: "short",
  }).format(d);
  const weekday = new Intl.DateTimeFormat("en-SG", {
    timeZone: SG_TZ,
    weekday: "short",
  }).format(d);
  return { day, month, weekday };
}
