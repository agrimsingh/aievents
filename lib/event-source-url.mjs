export const EVENT_SOURCE_HOSTS = [
  "luma.com",
  "lu.ma",
  "meetup.com",
  "growthx.club",
  "singapore.aitinkerers.org",
];

export const EVENT_IMAGE_HOSTS = [
  "images.lumacdn.com",
  "og.luma.com",
  "cdn.lu.ma",
  "sloppy-joe-app.imgix.net",
  "secure-content.meetupstatic.com",
  "secure.meetupstatic.com",
  "public-cdn.growthx.club",
];

function isAllowedHttpsUrl(rawUrl, allowedHosts) {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      allowedHosts.some(
        (allowedHost) =>
          hostname === allowedHost || hostname.endsWith(`.${allowedHost}`),
      )
    );
  } catch {
    return false;
  }
}

export function isAllowedEventSourceUrl(rawUrl) {
  return isAllowedHttpsUrl(rawUrl, EVENT_SOURCE_HOSTS);
}

export function isAllowedEventImageUrl(rawUrl) {
  return isAllowedHttpsUrl(rawUrl, EVENT_IMAGE_HOSTS);
}
