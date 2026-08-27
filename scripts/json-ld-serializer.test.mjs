import assert from "node:assert/strict";
import test from "node:test";

import { serializeJsonLd } from "../lib/json-ld-serializer.mjs";

test("escapes script termination and JavaScript separator characters", () => {
  const serialized = serializeJsonLd({
    description: "</script><script>alert(1)</script>&\u2028\u2029",
  });

  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("<script>"), false);
  assert.equal(serialized.includes("&"), false);
  assert.equal(serialized.includes("\u2028"), false);
  assert.equal(serialized.includes("\u2029"), false);
  assert.match(serialized, /\\u003c\/script\\u003e/);
});
