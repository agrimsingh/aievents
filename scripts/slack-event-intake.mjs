import { createHash } from "node:crypto";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { EVENT_SOURCE_HOSTS } from "../lib/event-source-url.mjs";

const DEFAULT_DATA_PATH = new URL("../data/slack-events.json", import.meta.url);
const DEFAULT_MANUAL_EVENTS_PATH = new URL("../data/events.ts", import.meta.url);
const MAX_AUTOMATED_EVENTS = 500;
const MAX_HISTORY_MESSAGES = 500;
const MAX_NEW_EVENTS_PER_RUN = 10;
const MAX_REMOVED_EVENTS_PER_RUN = 10;
const MAX_SLACK_EVENTS_FILE_BYTES = 100_000;
const SLACK_REQUEST_TIMEOUT_MS = 10_000;
const SLACK_RETRY_ATTEMPTS = 3;

export const DEFAULT_ALLOWED_HOSTS = EVENT_SOURCE_HOSTS;

function hostIsAllowed(hostname, allowedHosts) {
  return allowedHosts.some(
    (allowedHost) =>
      hostname === allowedHost || hostname.endsWith(`.${allowedHost}`),
  );
}

export function normalizeEventUrl(rawUrl, allowedHosts = DEFAULT_ALLOWED_HOSTS) {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !hostIsAllowed(hostname, allowedHosts)
    ) {
      return null;
    }

    url.hostname = hostname;
    url.hash = "";
    url.search = "";
    if (url.pathname.length > 1) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function extractEventUrls(text, allowedHosts = DEFAULT_ALLOWED_HOSTS) {
  if (typeof text !== "string") return [];

  const candidates = [];
  for (const match of text.matchAll(/<(https:\/\/[^>|]+)(?:\|[^>]*)?>/g)) {
    candidates.push(match[1]);
  }
  for (const match of text.matchAll(/https:\/\/[^\s<>]+/g)) {
    candidates.push(match[0].replace(/[),.;!?\]}]+$/g, ""));
  }

  return [
    ...new Set(
      candidates
        .map((candidate) => normalizeEventUrl(candidate, allowedHosts))
        .filter((url) => url !== null),
    ),
  ];
}

export function extractSingleEventUrlMessage(
  text,
  allowedHosts = DEFAULT_ALLOWED_HOSTS,
) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  const slackLink = trimmed.match(/^<(https:\/\/[^>|]+)(?:\|[^>]*)?>$/);
  const plainLink = trimmed.match(/^(https:\/\/[^\s<>]+)$/);
  const rawUrl = slackLink?.[1] ?? plainLink?.[1];
  return rawUrl ? normalizeEventUrl(rawUrl, allowedHosts) : null;
}

function reactingUsers(message, approverIds, reactionNames) {
  const approvers = new Set(approverIds);
  const configuredReactions = new Set(reactionNames);

  return [
    ...new Set(
      (message.reactions ?? [])
        .filter((reaction) => configuredReactions.has(reaction.name))
        .flatMap((reaction) => reaction.users ?? [])
        .filter((userId) => approvers.has(userId)),
    ),
  ];
}

function trustedEventMessage(message, approverIds, allowedHosts) {
  const approvers = new Set(approverIds);
  if (
    !message ||
    typeof message !== "object" ||
    message.bot_id ||
    message.edited ||
    (message.subtype && message.subtype !== "thread_broadcast") ||
    !approvers.has(message.user)
  ) {
    return null;
  }

  const sourceUrl = extractSingleEventUrlMessage(message.text, allowedHosts);
  if (!sourceUrl) return null;

  return {
    sourceUrl,
    messageTs: message.ts,
    submittedBy: message.user,
    contentHash: createHash("sha256")
      .update(message.text.trim())
      .digest("hex"),
  };
}

export function collectApprovedEventUrls(
  messages,
  {
    approverIds,
    approvalReactions = ["white_check_mark"],
    allowedHosts = DEFAULT_ALLOWED_HOSTS,
  },
) {
  const approved = new Map();

  for (const message of messages) {
    const eventMessage = trustedEventMessage(
      message,
      approverIds,
      allowedHosts,
    );
    if (!eventMessage) continue;

    const approvedBy = reactingUsers(message, approverIds, approvalReactions);
    if (approvedBy.length === 0) continue;

    const existing = approved.get(eventMessage.sourceUrl);
    if (!existing || Number(message.ts) < Number(existing.messageTs)) {
      approved.set(eventMessage.sourceUrl, {
        ...eventMessage,
        approvedBy,
      });
    }
  }

  return [...approved.values()].sort(
    (left, right) => Number(left.messageTs) - Number(right.messageTs),
  );
}

export function collectRemovedEventUrls(
  messages,
  {
    approverIds,
    removalReactions = ["wastebasket"],
    allowedHosts = DEFAULT_ALLOWED_HOSTS,
  },
) {
  const removed = new Map();

  for (const message of messages) {
    const eventMessage = trustedEventMessage(
      message,
      approverIds,
      allowedHosts,
    );
    if (!eventMessage) continue;

    const removedBy = reactingUsers(message, approverIds, removalReactions);
    if (removedBy.length === 0) continue;

    const existing = removed.get(eventMessage.sourceUrl);
    if (!existing || Number(message.ts) < Number(existing.messageTs)) {
      removed.set(eventMessage.sourceUrl, {
        ...eventMessage,
        removedBy,
      });
    }
  }

  return [...removed.values()].sort(
    (left, right) => Number(left.messageTs) - Number(right.messageTs),
  );
}

async function callSlack(method, params, token, fetchImpl = fetch) {
  const url = new URL(`https://slack.com/api/${method}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  for (let attempt = 0; attempt < SLACK_RETRY_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(SLACK_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt === SLACK_RETRY_ATTEMPTS - 1) throw error;
      await retryDelay(attempt);
      continue;
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === SLACK_RETRY_ATTEMPTS - 1) {
        throw new Error(`Slack ${method} returned HTTP ${response.status}`);
      }
      const retryAfterSeconds = Number(response.headers?.get?.("retry-after"));
      await retryDelay(attempt, retryAfterSeconds);
      continue;
    }
    if (!response.ok) {
      throw new Error(`Slack ${method} returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.ok) {
      throw new Error(
        `Slack ${method} failed: ${payload.error ?? "unknown_error"}`,
      );
    }
    return payload;
  }

  throw new Error(`Slack ${method} exhausted its retry budget`);
}

async function retryDelay(attempt, retryAfterSeconds) {
  const retryAfterMs = Number.isFinite(retryAfterSeconds)
    ? retryAfterSeconds * 1_000
    : 0;
  const backoffMs = 250 * 2 ** attempt + Math.floor(Math.random() * 250);
  const delayMs = Math.min(10_000, Math.max(retryAfterMs, backoffMs));
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function verifySlackWorkspace({
  expectedTeamId,
  token,
  fetchImpl = fetch,
}) {
  const payload = await callSlack("auth.test", {}, token, fetchImpl);
  if (payload.team_id !== expectedTeamId) {
    throw new Error("Slack token belongs to a different workspace");
  }
}

export async function fetchSlackMessages({
  channelId,
  token,
  oldest,
  fetchImpl = fetch,
}) {
  const messages = [];
  let cursor = "";

  for (let page = 0; page < 20; page += 1) {
    const payload = await callSlack(
      "conversations.history",
      {
        channel: channelId,
        cursor,
        inclusive: true,
        limit: 200,
        oldest,
      },
      token,
      fetchImpl,
    );
    messages.push(...(payload.messages ?? []));
    if (messages.length > MAX_HISTORY_MESSAGES) {
      throw new Error(
        `Slack history exceeded the ${MAX_HISTORY_MESSAGES}-message safety limit`,
      );
    }
    cursor = payload.response_metadata?.next_cursor?.trim() ?? "";
    if (!cursor) return messages;
  }

  throw new Error("Slack history exceeded the 20-page safety limit");
}

export async function fetchSlackMessage({
  channelId,
  messageTs,
  token,
  fetchImpl = fetch,
}) {
  if (!/^\d+\.\d+$/.test(messageTs)) {
    throw new Error("Slack message timestamp is invalid");
  }

  const payload = await callSlack(
    "conversations.history",
    {
      channel: channelId,
      inclusive: true,
      latest: messageTs,
      limit: 1,
      oldest: messageTs,
    },
    token,
    fetchImpl,
  );
  const message = (payload.messages ?? []).find(({ ts }) => ts === messageTs);
  if (!message) {
    throw new Error("Slack trigger message was not found");
  }
  return message;
}

function sourceUrlsFromTypescript(source) {
  return [...source.matchAll(/sourceUrl:\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
}

export function findNewApprovedUrls(
  approved,
  manualEventsSource,
  automatedEvents,
  allowedHosts = DEFAULT_ALLOWED_HOSTS,
) {
  const known = new Set(
    [...sourceUrlsFromTypescript(manualEventsSource), ...automatedEvents.map((e) => e.sourceUrl)]
      .map((url) => normalizeEventUrl(url, allowedHosts))
      .filter((url) => url !== null),
  );

  return approved.filter(({ sourceUrl }) => !known.has(sourceUrl));
}

export function deriveAutomatedEvents({
  approved,
  automatedEvents,
  baseAutomatedEvents,
  manualEventsSource,
  removed = [],
}) {
  const approvedAfterBase = findNewApprovedUrls(
    approved,
    manualEventsSource,
    baseAutomatedEvents,
  );
  const currentUrls = new Set(automatedEvents.map(({ sourceUrl }) => sourceUrl));
  const removalUrls = new Set(removed.map(({ sourceUrl }) => sourceUrl));
  const nextEvents = [
    ...baseAutomatedEvents,
    ...approvedAfterBase.map(({ sourceUrl }) => ({ sourceUrl })),
  ].filter(({ sourceUrl }) => !removalUrls.has(sourceUrl));
  validateAutomatedEvents(nextEvents);
  const nextUrls = new Set(nextEvents.map(({ sourceUrl }) => sourceUrl));
  const newApproved = approvedAfterBase.filter(
    ({ sourceUrl }) =>
      !currentUrls.has(sourceUrl) && !removalUrls.has(sourceUrl),
  );
  const removedUrls = automatedEvents
    .map(({ sourceUrl }) => sourceUrl)
    .filter((sourceUrl) => !nextUrls.has(sourceUrl));
  const stateChanged =
    JSON.stringify(automatedEvents) !== JSON.stringify(nextEvents);

  return { newApproved, nextEvents, removedUrls, stateChanged };
}

function parseList(value) {
  return (value ?? "")
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error(`Expected a number from 1 to ${maximum}, received ${value}`);
  }
  return parsed;
}

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function validateAutomatedEvents(automatedEvents) {
  if (
    !Array.isArray(automatedEvents) ||
    automatedEvents.length > MAX_AUTOMATED_EVENTS
  ) {
    throw new Error(
      `data/slack-events.json must contain at most ${MAX_AUTOMATED_EVENTS} entries`,
    );
  }

  const seen = new Set();
  for (const entry of automatedEvents) {
    const keys = entry && typeof entry === "object" ? Object.keys(entry) : [];
    const normalized =
      typeof entry?.sourceUrl === "string"
        ? normalizeEventUrl(entry.sourceUrl)
        : null;
    if (
      keys.length !== 1 ||
      keys[0] !== "sourceUrl" ||
      normalized === null ||
      normalized !== entry.sourceUrl
    ) {
      throw new Error(
        "data/slack-events.json entries must be exactly one normalized, allowlisted sourceUrl",
      );
    }
    if (seen.has(entry.sourceUrl)) {
      throw new Error("data/slack-events.json must not contain duplicate URLs");
    }
    seen.add(entry.sourceUrl);
  }

  return automatedEvents;
}

function auditKey(namespace, value) {
  return createHash("sha256")
    .update(`${namespace}:${value}`)
    .digest("hex")
    .slice(0, 12);
}

async function writeSummary(summaryPath, addedApproved, removedUrls, context) {
  const lines = [
    "## Slack-approved event intake",
    "",
    "This workflow run adds source URLs approved in the configured Slack intake channel.",
    "The site will hydrate their public event metadata through the existing JSON-LD pipeline.",
    "",
    ...addedApproved.flatMap(
      ({
        sourceUrl,
        messageTs,
        submittedBy,
        approvedBy,
        contentHash,
      }) => [
        `- ${sourceUrl}`,
        `  - Slack message: \`${auditKey(context.teamId, context.channelId)}:${messageTs}\``,
        `  - Submitter key: \`${auditKey(context.teamId, submittedBy)}\``,
        `  - Approver key(s): ${approvedBy.map((userId) => `\`${auditKey(context.teamId, userId)}\``).join(", ")}`,
        `  - Approval reaction(s): ${context.approvalReactions.map((reaction) => `\`:${reaction}:\``).join(", ")}`,
        `  - Message content SHA-256: \`${contentHash}\``,
      ],
    ),
    ...(removedUrls.length > 0
      ? [
          "",
          `Removed from the generated event data after an authorized ${context.removalReactions.map((reaction) => `\`:${reaction}:\``).join(" or ")} reaction:`,
          ...removedUrls.map((sourceUrl) => `- ${sourceUrl}`),
        ]
      : []),
    "",
    `Observed at: ${context.observedAt}`,
    ...(context.workflowUrl ? [`Workflow run: ${context.workflowUrl}`] : []),
    "Slack user and channel identifiers are one-way audit keys; private message text is not included.",
    "",
    "Post-publish checklist:",
    "- Confirm each event is relevant to Singapore's AI community.",
    "- Confirm the source page contains usable Event JSON-LD.",
    "- Add an explicit type, tags, or scrape fallback if the source needs them.",
    "",
  ];
  await writeFile(summaryPath, lines.join("\n"), "utf8");
}

async function writeGithubOutputs(changeCount, newApproved, summaryPath) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  await appendFile(
    outputPath,
    [
      `change_count=${changeCount}`,
      `new_count=${newApproved.length}`,
      `summary_path=${summaryPath}`,
      "",
    ].join("\n"),
    "utf8",
  );
}

export async function main() {
  const token = requireEnvironment("SLACK_BOT_TOKEN");
  const teamId = requireEnvironment("SLACK_TEAM_ID");
  const channelId = requireEnvironment("SLACK_EVENT_CHANNEL_ID");
  const approverIds = parseList(requireEnvironment("SLACK_EVENT_APPROVER_IDS"));
  const approvalReactions = parseList(
    process.env.SLACK_EVENT_APPROVAL_REACTIONS ?? "white_check_mark",
  );
  const removalReactions = parseList(
    process.env.SLACK_EVENT_REMOVAL_REACTIONS ?? "wastebasket",
  );
  const trigger = {
    channelId: process.env.SLACK_TRIGGER_CHANNEL_ID?.trim() ?? "",
    messageTs: process.env.SLACK_TRIGGER_MESSAGE_TS?.trim() ?? "",
    reaction: process.env.SLACK_TRIGGER_REACTION?.trim() ?? "",
    userId: process.env.SLACK_TRIGGER_USER_ID?.trim() ?? "",
  };
  const lookbackDays = parsePositiveInteger(
    process.env.SLACK_EVENT_LOOKBACK_DAYS,
    30,
    90,
  );
  const summaryPath =
    process.env.INTAKE_SUMMARY_PATH ?? "/tmp/slack-event-intake.md";
  const baseDataPath = process.env.SLACK_EVENT_BASE_DATA_PATH?.trim();

  if (!/^[CG][A-Z0-9]+$/.test(channelId)) {
    throw new Error("SLACK_EVENT_CHANNEL_ID must be a Slack channel ID");
  }
  if (!/^T[A-Z0-9]+$/.test(teamId)) {
    throw new Error("SLACK_TEAM_ID must be a Slack workspace ID");
  }
  if (
    approverIds.length === 0 ||
    approverIds.some((userId) => !/^[UW][A-Z0-9]+$/.test(userId))
  ) {
    throw new Error("SLACK_EVENT_APPROVER_IDS must contain Slack user IDs");
  }
  if (approvalReactions.length === 0) {
    throw new Error("At least one approval reaction is required");
  }
  if (removalReactions.length === 0) {
    throw new Error("At least one removal reaction is required");
  }
  if (approvalReactions.some((reaction) => removalReactions.includes(reaction))) {
    throw new Error("Approval and removal reactions must be different");
  }

  const triggerValues = Object.values(trigger);
  if (triggerValues.some(Boolean) && !triggerValues.every(Boolean)) {
    throw new Error("Slack trigger context must provide channel, message, reaction, and user");
  }
  if (trigger.messageTs) {
    if (trigger.channelId !== channelId) {
      throw new Error("Slack trigger channel does not match the configured channel");
    }
    if (!approverIds.includes(trigger.userId)) {
      throw new Error("Slack trigger user is not an allowlisted curator");
    }
    if (![...approvalReactions, ...removalReactions].includes(trigger.reaction)) {
      throw new Error("Slack trigger reaction is not configured");
    }
    if (!/^\d+\.\d+$/.test(trigger.messageTs)) {
      throw new Error("Slack trigger message timestamp is invalid");
    }
  }

  const oldest = String(Math.floor(Date.now() / 1000) - lookbackDays * 86_400);
  await verifySlackWorkspace({ expectedTeamId: teamId, token });
  const [
    messages,
    triggerMessage,
    manualEventsSource,
    automatedEventsSource,
    baseAutomatedEventsSource,
  ] = await Promise.all([
    fetchSlackMessages({ channelId, token, oldest }),
    trigger.messageTs
      ? fetchSlackMessage({
          channelId,
          messageTs: trigger.messageTs,
          token,
        })
      : Promise.resolve(null),
    readFile(DEFAULT_MANUAL_EVENTS_PATH, "utf8"),
    readFile(DEFAULT_DATA_PATH, "utf8"),
    baseDataPath
      ? readFile(baseDataPath, "utf8")
      : readFile(DEFAULT_DATA_PATH, "utf8"),
  ]);
  for (const source of [automatedEventsSource, baseAutomatedEventsSource]) {
    if (Buffer.byteLength(source, "utf8") > MAX_SLACK_EVENTS_FILE_BYTES) {
      throw new Error(
        `data/slack-events.json exceeds ${MAX_SLACK_EVENTS_FILE_BYTES} bytes`,
      );
    }
  }
  const automatedEvents = validateAutomatedEvents(JSON.parse(automatedEventsSource));
  const baseAutomatedEvents = validateAutomatedEvents(
    JSON.parse(baseAutomatedEventsSource),
  );
  const observedMessages = triggerMessage
    ? [triggerMessage, ...messages.filter(({ ts }) => ts !== triggerMessage.ts)]
    : messages;

  const approved = collectApprovedEventUrls(observedMessages, {
    approverIds,
    approvalReactions,
  });
  const removed = collectRemovedEventUrls(observedMessages, {
    approverIds,
    removalReactions,
  });
  const { newApproved, nextEvents, removedUrls, stateChanged } =
    deriveAutomatedEvents({
      approved,
      automatedEvents,
      baseAutomatedEvents,
      manualEventsSource,
      removed,
    });

  if (newApproved.length > MAX_NEW_EVENTS_PER_RUN) {
    throw new Error(
      `Refusing to add more than ${MAX_NEW_EVENTS_PER_RUN} events in one run`,
    );
  }
  if (removedUrls.length > MAX_REMOVED_EVENTS_PER_RUN) {
    throw new Error(
      `Refusing to remove more than ${MAX_REMOVED_EVENTS_PER_RUN} events in one run`,
    );
  }
  const changeCount = stateChanged
    ? Math.max(1, newApproved.length + removedUrls.length)
    : 0;

  if (stateChanged) {
    await writeFile(
      DEFAULT_DATA_PATH,
      `${JSON.stringify(nextEvents, null, 2)}\n`,
      "utf8",
    );
  }

  const observedAt = new Date().toISOString();
  const workflowUrl =
    process.env.GITHUB_SERVER_URL &&
    process.env.GITHUB_REPOSITORY &&
    process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "";
  await writeSummary(summaryPath, newApproved, removedUrls, {
    approvalReactions,
    channelId,
    observedAt,
    removalReactions,
    teamId,
    workflowUrl,
  });
  await writeGithubOutputs(changeCount, newApproved, summaryPath);
  console.log(
    JSON.stringify(
      {
        approvedUrlCount: approved.length,
        changeCount,
        newUrlCount: newApproved.length,
        newUrls: newApproved.map(({ sourceUrl }) => sourceUrl),
        removalDecisionCount: removed.length,
        removedUrls,
      },
      null,
      2,
    ),
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
