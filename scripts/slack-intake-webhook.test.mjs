import assert from "node:assert/strict";
import test from "node:test";

import {
  createSlackSignature,
  handleSlackIntakeWebhook,
  verifySlackSignature,
} from "../lib/slack-intake-webhook.mjs";

const NOW_SECONDS = 1_787_889_600;
const SIGNING_SECRET = "test-signing-secret";
const BASE_ENVIRONMENT = {
  GITHUB_WORKFLOW_REF: "main",
  GITHUB_WORKFLOW_REPOSITORY: "agrimsingh/aievents",
  GITHUB_WORKFLOW_TOKEN: "test-github-token",
  SLACK_APP_ID: "A0BT435HL3B",
  SLACK_EVENT_APPROVER_IDS: "U0ADS49R3EC,U0ACVP9PPK8,U0BS49B3BGE",
  SLACK_EVENT_CHANNEL_ID: "C0BSM0S282Y",
  SLACK_EVENT_REMOVAL_REACTIONS: "wastebasket",
  SLACK_SIGNING_SECRET: SIGNING_SECRET,
  SLACK_TEAM_ID: "T0ACRD76KMH",
};

function signedRequest(payload, overrides = {}) {
  const rawBody = JSON.stringify(payload);
  const timestamp = String(overrides.timestamp ?? NOW_SECONDS);
  return {
    environment: overrides.environment ?? BASE_ENVIRONMENT,
    headers: new Headers({
      "x-slack-request-timestamp": timestamp,
      "x-slack-signature":
        overrides.signature ??
        createSlackSignature(SIGNING_SECRET, timestamp, rawBody),
    }),
    nowMs: NOW_SECONDS * 1000,
    rawBody,
  };
}

function reactionPayload(overrides = {}) {
  return {
    api_app_id: "A0BT435HL3B",
    event: {
      item: {
        channel: "C0BSM0S282Y",
        ts: "1787887618.815729",
        type: "message",
      },
      reaction: "white_check_mark",
      type: "reaction_added",
      user: "U0ADS49R3EC",
      ...overrides,
    },
    event_id: "Ev-test-1",
    team_id: "T0ACRD76KMH",
    type: "event_callback",
  };
}

test("accepts current Slack signatures and rejects tampered or stale requests", () => {
  const rawBody = JSON.stringify({ type: "event_callback" });
  const timestamp = String(NOW_SECONDS);
  const signature = createSlackSignature(
    SIGNING_SECRET,
    timestamp,
    rawBody,
  );

  assert.equal(
    verifySlackSignature({
      nowMs: NOW_SECONDS * 1000,
      rawBody,
      signature,
      signingSecret: SIGNING_SECRET,
      timestamp,
    }),
    true,
  );
  assert.equal(
    verifySlackSignature({
      nowMs: NOW_SECONDS * 1000,
      rawBody: `${rawBody} `,
      signature,
      signingSecret: SIGNING_SECRET,
      timestamp,
    }),
    false,
  );
  assert.equal(
    verifySlackSignature({
      nowMs: (NOW_SECONDS + 301) * 1000,
      rawBody,
      signature,
      signingSecret: SIGNING_SECRET,
      timestamp,
    }),
    false,
  );
});

test("answers Slack URL verification after validating the signature and source", async () => {
  const result = await handleSlackIntakeWebhook(
    signedRequest({
      challenge: "test-challenge",
      type: "url_verification",
    }),
  );

  assert.deepEqual(result, {
    body: { challenge: "test-challenge" },
    status: 200,
  });
});

test("dispatches the intake workflow for an allowlisted approval reaction", async () => {
  const calls = [];
  const result = await handleSlackIntakeWebhook({
    ...signedRequest(reactionPayload()),
    fetchImpl: async (url, init) => {
      calls.push({ init, url });
      return new Response(null, { status: 204 });
    },
  });

  assert.equal(result.status, 202);
  assert.equal(result.body.workflowDispatched, true);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    "https://api.github.com/repos/agrimsingh/aievents/actions/workflows/slack-event-intake.yml/dispatches",
  );
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    inputs: {
      slack_channel_id: "C0BSM0S282Y",
      slack_message_ts: "1787887618.815729",
      slack_reaction: "white_check_mark",
      slack_user_id: "U0ADS49R3EC",
    },
    ref: "main",
  });
  assert.equal(
    calls[0].init.headers.Authorization,
    "Bearer test-github-token",
  );
});

test("dispatches the intake workflow for an allowlisted removal reaction", async () => {
  const calls = [];
  const result = await handleSlackIntakeWebhook({
    ...signedRequest(reactionPayload({ reaction: "wastebasket" })),
    fetchImpl: async (url, init) => {
      calls.push({ init, url });
      return new Response(null, { status: 204 });
    },
  });

  assert.equal(result.status, 202);
  assert.equal(
    JSON.parse(calls[0].init.body).inputs.slack_reaction,
    "wastebasket",
  );
});

test("ignores unrelated reactions, channels, and users without dispatching", async () => {
  for (const event of [
    { reaction: "eyes" },
    { item: { channel: "COTHER", ts: "1", type: "message" } },
    {
      item: {
        channel: "C0BSM0S282Y",
        ts: "not-a-message-ts",
        type: "message",
      },
    },
    { user: "UUNTRUSTED" },
  ]) {
    let called = false;
    const result = await handleSlackIntakeWebhook({
      ...signedRequest(reactionPayload(event)),
      fetchImpl: async () => {
        called = true;
        return new Response(null, { status: 204 });
      },
    });

    assert.deepEqual(result, {
      body: { ignored: true, ok: true },
      status: 200,
    });
    assert.equal(called, false);
  }
});

test("fails closed for bad signatures, unexpected workspaces, and missing config", async () => {
  const invalidSignature = await handleSlackIntakeWebhook({
    ...signedRequest(reactionPayload()),
    headers: new Headers({
      "x-slack-request-timestamp": String(NOW_SECONDS),
      "x-slack-signature": "v0=invalid",
    }),
  });
  assert.equal(invalidSignature.status, 401);

  const unexpectedTeam = await handleSlackIntakeWebhook(
    signedRequest({ ...reactionPayload(), team_id: "TOTHER" }),
  );
  assert.equal(unexpectedTeam.status, 403);

  const missingConfig = await handleSlackIntakeWebhook(
    signedRequest(reactionPayload(), { environment: {} }),
  );
  assert.equal(missingConfig.status, 503);
});

test("returns a retryable error when GitHub rejects the dispatch", async () => {
  const result = await handleSlackIntakeWebhook({
    ...signedRequest(reactionPayload()),
    fetchImpl: async () => new Response(null, { status: 403 }),
  });

  assert.deepEqual(result, {
    body: { error: "workflow_dispatch_failed", ok: false },
    status: 502,
  });
});
