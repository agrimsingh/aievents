import { handleSlackIntakeWebhook } from "@/lib/slack-intake-webhook.mjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const result = await handleSlackIntakeWebhook({
    environment: process.env,
    headers: request.headers,
    rawBody: await request.text(),
  });

  return Response.json(result.body, {
    headers: { "Cache-Control": "no-store" },
    status: result.status,
  });
}
