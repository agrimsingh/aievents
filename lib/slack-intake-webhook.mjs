import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_SLACK_REQUEST_AGE_SECONDS = 300;
const WORKFLOW_FILE = "slack-event-intake.yml";

function requiredEnvironment(environment, name) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseList(value) {
  return value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonResult(status, body) {
  return { body, status };
}

export function createSlackSignature(signingSecret, timestamp, rawBody) {
  return `v0=${createHmac("sha256", signingSecret)
    .update(`v0:${timestamp}:${rawBody}`)
    .digest("hex")}`;
}

export function verifySlackSignature({
  nowMs = Date.now(),
  rawBody,
  signature,
  signingSecret,
  timestamp,
}) {
  if (!/^\d+$/.test(timestamp ?? "") || !signature?.startsWith("v0=")) {
    return false;
  }

  const requestSeconds = Number(timestamp);
  const nowSeconds = Math.floor(nowMs / 1000);
  if (
    !Number.isSafeInteger(requestSeconds) ||
    Math.abs(nowSeconds - requestSeconds) > MAX_SLACK_REQUEST_AGE_SECONDS
  ) {
    return false;
  }

  const expected = Buffer.from(
    createSlackSignature(signingSecret, timestamp, rawBody),
    "utf8",
  );
  const received = Buffer.from(signature, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function handleSlackIntakeWebhook({
  environment,
  fetchImpl = fetch,
  headers,
  nowMs = Date.now(),
  rawBody,
}) {
  let configuration;
  try {
    const repository = requiredEnvironment(
      environment,
      "GITHUB_WORKFLOW_REPOSITORY",
    );
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
      throw new Error("GITHUB_WORKFLOW_REPOSITORY must be owner/repository");
    }

    configuration = {
      appId: requiredEnvironment(environment, "SLACK_APP_ID"),
      approverIds: new Set(
        parseList(
          requiredEnvironment(environment, "SLACK_EVENT_APPROVER_IDS"),
        ),
      ),
      approvalReactions: new Set(
        parseList(
          environment.SLACK_EVENT_APPROVAL_REACTIONS?.trim() ||
            "white_check_mark",
        ),
      ),
      channelId: requiredEnvironment(environment, "SLACK_EVENT_CHANNEL_ID"),
      githubToken: requiredEnvironment(environment, "GITHUB_WORKFLOW_TOKEN"),
      ref: environment.GITHUB_WORKFLOW_REF?.trim() || "main",
      repository,
      signingSecret: requiredEnvironment(environment, "SLACK_SIGNING_SECRET"),
      teamId: requiredEnvironment(environment, "SLACK_TEAM_ID"),
    };
  } catch {
    return jsonResult(503, { error: "webhook_not_configured", ok: false });
  }

  const signature = headers.get("x-slack-signature");
  const timestamp = headers.get("x-slack-request-timestamp");
  if (
    !verifySlackSignature({
      nowMs,
      rawBody,
      signature,
      signingSecret: configuration.signingSecret,
      timestamp,
    })
  ) {
    return jsonResult(401, { error: "invalid_signature", ok: false });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResult(400, { error: "invalid_json", ok: false });
  }

  if (payload.type === "url_verification") {
    if (
      (payload.team_id && payload.team_id !== configuration.teamId) ||
      (payload.api_app_id && payload.api_app_id !== configuration.appId)
    ) {
      return jsonResult(403, { error: "unexpected_slack_source", ok: false });
    }

    return typeof payload.challenge === "string"
      ? jsonResult(200, { challenge: payload.challenge })
      : jsonResult(400, { error: "missing_challenge", ok: false });
  }

  if (
    payload.team_id !== configuration.teamId ||
    payload.api_app_id !== configuration.appId
  ) {
    return jsonResult(403, { error: "unexpected_slack_source", ok: false });
  }

  const event = payload.event;
  const shouldDispatch =
    payload.type === "event_callback" &&
    event?.type === "reaction_added" &&
    configuration.approvalReactions.has(event.reaction) &&
    configuration.approverIds.has(event.user) &&
    event.item?.type === "message" &&
    event.item.channel === configuration.channelId;

  if (!shouldDispatch) {
    return jsonResult(200, { ignored: true, ok: true });
  }

  const [owner, repository] = configuration.repository.split("/");
  const dispatchResponse = await fetchImpl(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      body: JSON.stringify({ ref: configuration.ref }),
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${configuration.githubToken}`,
        "Content-Type": "application/json",
        "User-Agent": "aievents-slack-intake",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      method: "POST",
    },
  );

  if (!dispatchResponse.ok) {
    return jsonResult(502, { error: "workflow_dispatch_failed", ok: false });
  }

  return jsonResult(202, {
    eventId: typeof payload.event_id === "string" ? payload.event_id : null,
    ok: true,
    workflowDispatched: true,
  });
}
