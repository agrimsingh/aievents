export function boundedText(value, maximum) {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\0/g, "").trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maximum);
}

export function safeHttpsUrl(value) {
  if (typeof value !== "string" || value.length > 2_000) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function validEventDate(value) {
  if (typeof value !== "string" || value.length > 100) return undefined;
  return Number.isFinite(Date.parse(value)) ? value : undefined;
}
