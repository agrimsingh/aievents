import { buildEventsApiResponse } from "@/lib/api-events";
import { getAllEvents } from "@/lib/luma";

export const revalidate = 3600;

const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const events = await getAllEvents();
  const response = buildEventsApiResponse(events, url.searchParams);

  return Response.json(response, {
    headers: API_HEADERS,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: API_HEADERS,
  });
}
