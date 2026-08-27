import { isAllowedEventSourceUrl } from "./event-source-url.mjs";

export const EVENT_FETCH_TIMEOUT_MS = 10_000;
export const MAX_EVENT_HTML_BYTES = 2_000_000;
export const MAX_EVENT_REDIRECTS = 3;

export async function fetchEventPage(
  sourceUrl,
  {
    fetchImpl = fetch,
    maxRedirects = MAX_EVENT_REDIRECTS,
    timeoutMs = EVENT_FETCH_TIMEOUT_MS,
  } = {},
) {
  let currentUrl = sourceUrl;

  for (
    let redirectCount = 0;
    redirectCount <= maxRedirects;
    redirectCount += 1
  ) {
    if (!isAllowedEventSourceUrl(currentUrl)) {
      throw new Error(`Blocked event source URL: ${currentUrl}`);
    }

    const response = await fetchImpl(currentUrl, {
      next: { revalidate: 3600 },
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIEventsSG/1.0; +https://aievents.sg) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-SG,en;q=0.9",
      },
    });

    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`Event redirect had no location: ${currentUrl}`);
    }
    currentUrl = new URL(location, currentUrl).toString();
  }

  throw new Error(`Event source exceeded ${maxRedirects} redirects`);
}

export async function readEventHtml(
  response,
  maximumBytes = MAX_EVENT_HTML_BYTES,
) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml+xml")
  ) {
    throw new Error(`Unexpected event content type: ${contentType || "missing"}`);
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new Error(`Event page exceeds ${maximumBytes} bytes`);
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumBytes) {
      await reader.cancel();
      throw new Error(`Event page exceeds ${maximumBytes} bytes`);
    }
    html += decoder.decode(value, { stream: true });
  }

  return html + decoder.decode();
}
