---
title: Fallback when event pages block server fetch
category: fix
createdAt: 2026-04-13T16:00:00.000Z
---

Some hosts serve a bot or challenge page to datacenter fetches, so JSON-LD never appears during Vercel builds or ISR. Curated entries may now include optional `scrapeFallback` with title, dates, description, location, and cover—used only when fetch fails or JSON-LD is missing.

The AI Tinkerers Singapore listing includes a fallback snapshot. Fetches also use a browser-style `User-Agent` and broader `Accept` headers to reduce interstitials where allowed.
