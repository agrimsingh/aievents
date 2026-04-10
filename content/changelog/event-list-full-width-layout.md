---
title: Event list uses full row width
category: improvement
createdAt: 2026-04-10T15:30:00.000Z
---

“More coming up” rows no longer shrink to the width of a single short entry. The flexible column uses `minmax(0, 1fr)` instead of plain `1fr`, and the page shell, main, list wrapper, `ul`/`li`, and each entry article carry `w-full` / `min-w-0` so width flows through flex layouts instead of content-sizing.

The curated Luma entry for the Vercel event is explicitly typed as a hackathon with a Vercel tag. `AGENTS.md` gains durable workspace facts (GitHub repo, Vercel hosting, stack summary).
