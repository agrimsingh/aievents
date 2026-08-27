import assert from "node:assert/strict";
import test from "node:test";

import {
  isAllowedEventImageUrl,
  isAllowedEventSourceUrl,
} from "../lib/event-source-url.mjs";
import {
  boundedText,
  safeHttpsUrl,
  validEventDate,
} from "../lib/event-record-sanitizer.mjs";
import {
  fetchEventPage,
  readEventHtml,
} from "../lib/safe-event-fetch.mjs";

test("rejects redirects from an allowed source to a private address", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return new Response(null, {
      status: 302,
      headers: { location: "http://169.254.169.254/latest/meta-data" },
    });
  };

  await assert.rejects(
    fetchEventPage("https://luma.com/event", { fetchImpl }),
    /Blocked event source URL/,
  );
  assert.equal(calls, 1);
});

test("caps redirect chains and keeps fetch in manual mode", async () => {
  let calls = 0;
  let sawManualRedirect = false;
  let sawTimeoutSignal = false;
  const fetchImpl = async (_url, init) => {
    calls += 1;
    sawManualRedirect ||= init.redirect === "manual";
    sawTimeoutSignal ||= init.signal instanceof AbortSignal;
    return new Response(null, {
      status: 302,
      headers: { location: "https://luma.com/again" },
    });
  };

  await assert.rejects(
    fetchEventPage("https://luma.com/event", {
      fetchImpl,
      maxRedirects: 2,
      timeoutMs: 50,
    }),
    /exceeded 2 redirects/,
  );
  assert.equal(calls, 3);
  assert.equal(sawManualRedirect, true);
  assert.equal(sawTimeoutSignal, true);
});

test("requires HTML and enforces declared and streamed body limits", async () => {
  await assert.rejects(
    readEventHtml(
      new Response("{}", { headers: { "content-type": "application/json" } }),
      10,
    ),
    /Unexpected event content type/,
  );
  await assert.rejects(
    readEventHtml(
      new Response("small", {
        headers: {
          "content-length": "100",
          "content-type": "text/html",
        },
      }),
      10,
    ),
    /exceeds 10 bytes/,
  );
  await assert.rejects(
    readEventHtml(
      new Response("this body is too large", {
        headers: { "content-type": "text/html" },
      }),
      10,
    ),
    /exceeds 10 bytes/,
  );
});

test("source and image URL allowlists reject suffix tricks and unknown hosts", () => {
  assert.equal(isAllowedEventSourceUrl("https://www.luma.com/event"), true);
  assert.equal(isAllowedEventSourceUrl("https://luma.com.evil.test/event"), false);
  assert.equal(
    isAllowedEventImageUrl("https://images.lumacdn.com/cover.png"),
    true,
  );
  assert.equal(
    isAllowedEventImageUrl("https://attacker.example/cover.png"),
    false,
  );
});

test("sanitizes remote event fields before rendering", () => {
  assert.equal(boundedText("  hello\0world  ", 20), "helloworld");
  assert.equal(boundedText("123456", 4), "1234");
  assert.equal(validEventDate("not-a-date"), undefined);
  assert.equal(
    validEventDate("2026-09-04T18:00:00+08:00"),
    "2026-09-04T18:00:00+08:00",
  );
  assert.equal(safeHttpsUrl("http://example.com"), undefined);
  assert.equal(safeHttpsUrl("https://user@example.com"), undefined);
});
