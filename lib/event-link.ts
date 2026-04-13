/** Hosts where the listing CTA should read "Luma". */
export function isLumaEventUrl(sourceUrl: string): boolean {
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase();
    return (
      host === "luma.com" ||
      host.endsWith(".luma.com") ||
      host === "lu.ma" ||
      host.endsWith(".lu.ma")
    );
  } catch {
    return false;
  }
}

export function eventListCtaLabel(sourceUrl: string): string {
  return isLumaEventUrl(sourceUrl) ? "Luma" : "Details";
}

export function eventFeaturedCtaLabel(sourceUrl: string): string {
  return isLumaEventUrl(sourceUrl) ? "View on Luma" : "View event";
}
