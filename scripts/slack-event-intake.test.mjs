import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  collectApprovedEventUrls,
  collectRemovedEventUrls,
  deriveAutomatedEvents,
  extractEventUrls,
  extractSingleEventUrlMessage,
  fetchSlackMessage,
  fetchSlackMessages,
  findNewApprovedUrls,
  normalizeEventUrl,
  validateAutomatedEvents,
  verifySlackWorkspace,
} from "./slack-event-intake.mjs";

function contentHash(text) {
  return createHash("sha256").update(text).digest("hex");
}

test("normalizes supported event URLs and strips tracking data", () => {
  assert.equal(
    normalizeEventUrl(
      "https://WWW.LUMA.COM/grokbotsg/?utm_source=slack&ref=channel#about",
    ),
    "https://www.luma.com/grokbotsg",
  );
  assert.equal(
    normalizeEventUrl("https://www.meetup.com/group/events/123/?z=2&a=1"),
    "https://www.meetup.com/group/events/123",
  );
});

test("rejects non-HTTPS, credentialed, ported, and unapproved hosts", () => {
  assert.equal(normalizeEventUrl("http://luma.com/event"), null);
  assert.equal(normalizeEventUrl("https://user@example.com/event"), null);
  assert.equal(normalizeEventUrl("https://luma.com:8443/event"), null);
  assert.equal(normalizeEventUrl("https://example.com/event"), null);
  assert.equal(normalizeEventUrl("https://luma.com.evil.test/event"), null);
});

test("extracts Slack-formatted and plain URLs without duplicates", () => {
  assert.deepEqual(
    extractEventUrls(
      "try <https://luma.com/abc?utm_medium=chat|this one> and https://luma.com/abc.",
    ),
    ["https://luma.com/abc"],
  );
});

test("accepts only a single URL-only Slack message", () => {
  assert.equal(
    extractSingleEventUrlMessage("  <https://luma.com/abc|event>  "),
    "https://luma.com/abc",
  );
  assert.equal(
    extractSingleEventUrlMessage("https://luma.com/abc"),
    "https://luma.com/abc",
  );
  assert.equal(
    extractSingleEventUrlMessage("please add https://luma.com/abc"),
    null,
  );
});

test("requires an allowlisted user's configured approval reaction", () => {
  const messages = [
    {
      ts: "100.1",
      user: "U_APPROVER",
      text: "https://luma.com/approved",
      reactions: [
        { name: "white_check_mark", users: ["U_APPROVER"], count: 1 },
      ],
    },
    {
      ts: "101.1",
      user: "U_SUBMITTER",
      text: "https://luma.com/not-approved",
      reactions: [
        { name: "white_check_mark", users: ["U_SOMEONE_ELSE"], count: 1 },
      ],
    },
    {
      ts: "102.1",
      user: "U_SUBMITTER",
      text: "https://luma.com/wrong-reaction",
      reactions: [{ name: "eyes", users: ["U_APPROVER"], count: 1 }],
    },
  ];

  assert.deepEqual(
    collectApprovedEventUrls(messages, { approverIds: ["U_APPROVER"] }),
    [
      {
        sourceUrl: "https://luma.com/approved",
        messageTs: "100.1",
        submittedBy: "U_APPROVER",
        approvedBy: ["U_APPROVER"],
        contentHash: contentHash("https://luma.com/approved"),
      },
    ],
  );
});

test("ignores bot messages and deduplicates repeated approved URLs", () => {
  const approval = [
    { name: "white_check_mark", users: ["U_APPROVER"], count: 1 },
  ];
  const messages = [
    {
      ts: "202.1",
      bot_id: "B_BOT",
      text: "https://luma.com/bot",
      reactions: approval,
    },
    {
      ts: "201.1",
      user: "U_APPROVER",
      text: "https://luma.com/same",
      reactions: approval,
    },
    {
      ts: "200.1",
      user: "U_APPROVER",
      text: "https://luma.com/same?utm_source=again",
      reactions: approval,
    },
  ];

  assert.deepEqual(
    collectApprovedEventUrls(messages, { approverIds: ["U_APPROVER"] }),
    [
      {
        sourceUrl: "https://luma.com/same",
        messageTs: "200.1",
        submittedBy: "U_APPROVER",
        approvedBy: ["U_APPROVER"],
        contentHash: contentHash("https://luma.com/same?utm_source=again"),
      },
    ],
  );
});

test("requires a trusted submitter and exactly one approved event URL", () => {
  const approval = [
    { name: "white_check_mark", users: ["U_APPROVER"], count: 1 },
  ];
  const messages = [
    {
      ts: "1",
      user: "U_UNTRUSTED",
      text: "https://luma.com/edited-after-approval",
      reactions: approval,
    },
    {
      ts: "2",
      user: "U_APPROVER",
      text: "https://luma.com/one https://luma.com/two",
      reactions: approval,
    },
    {
      ts: "3",
      user: "U_APPROVER",
      text: "https://luma.com/edited",
      edited: { user: "U_APPROVER", ts: "3.1" },
      reactions: approval,
    },
  ];

  assert.deepEqual(
    collectApprovedEventUrls(messages, { approverIds: ["U_APPROVER"] }),
    [],
  );
});

test("requires an allowlisted curator's removal reaction on a trusted message", () => {
  const removal = [
    { name: "wastebasket", users: ["U_APPROVER"], count: 1 },
  ];
  const messages = [
    {
      ts: "100.1",
      user: "U_APPROVER",
      text: "https://luma.com/remove-me",
      reactions: removal,
    },
    {
      ts: "101.1",
      user: "U_UNTRUSTED",
      text: "https://luma.com/untrusted-submitter",
      reactions: removal,
    },
    {
      ts: "102.1",
      user: "U_APPROVER",
      text: "https://luma.com/untrusted-remover",
      reactions: [
        { name: "wastebasket", users: ["U_OTHER"], count: 1 },
      ],
    },
    {
      ts: "103.1",
      user: "U_APPROVER",
      text: "https://luma.com/edited",
      edited: { user: "U_APPROVER", ts: "103.2" },
      reactions: removal,
    },
  ];

  assert.deepEqual(
    collectRemovedEventUrls(messages, { approverIds: ["U_APPROVER"] }),
    [
      {
        sourceUrl: "https://luma.com/remove-me",
        messageTs: "100.1",
        submittedBy: "U_APPROVER",
        removedBy: ["U_APPROVER"],
        contentHash: contentHash("https://luma.com/remove-me"),
      },
    ],
  );
});

test("accepts only canonical sourceUrl-only automated entries", () => {
  assert.deepEqual(
    validateAutomatedEvents([{ sourceUrl: "https://luma.com/approved" }]),
    [{ sourceUrl: "https://luma.com/approved" }],
  );
  assert.throws(() =>
    validateAutomatedEvents([
      { sourceUrl: "https://luma.com/approved", tags: ["injected"] },
    ]),
  );
  assert.throws(() =>
    validateAutomatedEvents([{ sourceUrl: "https://luma.com/approved?token=x" }]),
  );
  assert.throws(() =>
    validateAutomatedEvents([{ sourceUrl: "https://example.com/event" }]),
  );
  assert.throws(() =>
    validateAutomatedEvents([
      { sourceUrl: "https://luma.com/duplicate" },
      { sourceUrl: "https://luma.com/duplicate" },
    ]),
  );
});

test("filters URLs already present in either curated source", () => {
  const approved = [
    { sourceUrl: "https://luma.com/manual", messageTs: "1" },
    { sourceUrl: "https://luma.com/automated", messageTs: "2" },
    { sourceUrl: "https://luma.com/new", messageTs: "3" },
  ];
  const manual = `const events = [{ sourceUrl:\n  "https://luma.com/manual" }];`;
  const automated = [{ sourceUrl: "https://luma.com/automated" }];

  assert.deepEqual(findNewApprovedUrls(approved, manual, automated), [
    { sourceUrl: "https://luma.com/new", messageTs: "3" },
  ]);
});

test("rebuilds generated state from merged data and current Slack approvals", () => {
  const approved = [
    { sourceUrl: "https://luma.com/approved", messageTs: "1" },
  ];
  const baseAutomatedEvents = [{ sourceUrl: "https://luma.com/merged" }];
  const automatedEvents = [
    { sourceUrl: "https://luma.com/merged" },
    { sourceUrl: "https://luma.com/approved" },
    { sourceUrl: "https://luma.com/injected" },
  ];

  assert.deepEqual(
    deriveAutomatedEvents({
      approved,
      automatedEvents,
      baseAutomatedEvents,
      manualEventsSource: "export const events = [];",
    }),
    {
      newApproved: [],
      nextEvents: [
        { sourceUrl: "https://luma.com/merged" },
        { sourceUrl: "https://luma.com/approved" },
      ],
      removedUrls: ["https://luma.com/injected"],
      stateChanged: true,
    },
  );
});

test("an authorized removal wins when approval and removal are both present", () => {
  assert.deepEqual(
    deriveAutomatedEvents({
      approved: [{ sourceUrl: "https://luma.com/event", messageTs: "1" }],
      removed: [{ sourceUrl: "https://luma.com/event", messageTs: "1" }],
      automatedEvents: [{ sourceUrl: "https://luma.com/event" }],
      baseAutomatedEvents: [{ sourceUrl: "https://luma.com/event" }],
      manualEventsSource: "export const events = [];",
    }),
    {
      newApproved: [],
      nextEvents: [],
      removedUrls: ["https://luma.com/event"],
      stateChanged: true,
    },
  );
});

test("paginates Slack history and stops at the final cursor", async () => {
  const requestedCursors = [];
  const fetchImpl = async (url) => {
    const cursor = url.searchParams.get("cursor") ?? "";
    requestedCursors.push(cursor);
    const first = cursor === "";
    return {
      ok: true,
      async json() {
        return {
          ok: true,
          messages: [{ ts: first ? "2" : "1" }],
          response_metadata: { next_cursor: first ? "next" : "" },
        };
      },
    };
  };

  const messages = await fetchSlackMessages({
    channelId: "C_CHANNEL",
    token: "xoxb-test",
    oldest: "0",
    fetchImpl,
  });

  assert.deepEqual(requestedCursors, ["", "next"]);
  assert.deepEqual(messages, [{ ts: "2" }, { ts: "1" }]);
});

test("fetches the exact Slack trigger message outside the lookback window", async () => {
  const fetchImpl = async (url) => {
    assert.equal(url.searchParams.get("channel"), "C_CHANNEL");
    assert.equal(url.searchParams.get("oldest"), "100.123");
    assert.equal(url.searchParams.get("latest"), "100.123");
    assert.equal(url.searchParams.get("inclusive"), "true");
    assert.equal(url.searchParams.get("limit"), "1");
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return { ok: true, messages: [{ ts: "100.123", text: "event" }] };
      },
    };
  };

  assert.deepEqual(
    await fetchSlackMessage({
      channelId: "C_CHANNEL",
      messageTs: "100.123",
      token: "xoxb-test",
      fetchImpl,
    }),
    { ts: "100.123", text: "event" },
  );
  await assert.rejects(
    fetchSlackMessage({
      channelId: "C_CHANNEL",
      messageTs: "invalid",
      token: "xoxb-test",
      fetchImpl,
    }),
    /timestamp is invalid/,
  );
});

test("retries a transient Slack rate limit", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: { get: () => "0" },
      };
    }
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return { ok: true, messages: [], response_metadata: {} };
      },
    };
  };

  await fetchSlackMessages({
    channelId: "C_CHANNEL",
    token: "xoxb-test",
    oldest: "0",
    fetchImpl,
  });
  assert.equal(calls, 2);
});

test("fails closed when the Slack token belongs to another workspace", async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return { ok: true, team_id: "T_WRONG" };
    },
  });

  await assert.rejects(
    verifySlackWorkspace({
      expectedTeamId: "T_EXPECTED",
      token: "xoxb-test",
      fetchImpl,
    }),
    /different workspace/,
  );
});
