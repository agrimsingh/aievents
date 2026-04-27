---
title: Road to AIE Luma meetups in curated list
category: feature
createdAt: 2026-04-13T18:00:00.000Z
---

Adds upcoming events linked from the Road to AI Engineer Singapore series (Luma), excluding the main hub page: **Build or Die (OpenAI)**, **Magic Patterns Singapore**, **Adaption X Singapore** (with `scrapeFallback` where static HTML lacks `Event` JSON-LD), and **Celebrating Exa in Singapore** (same fallback pattern; canonical `4ogc0024` URL).

A short comment in `data/events.ts` still points to `luma.com/1eofvp02` for the full list without listing the hub as its own event.

`AGENTS.md` documents `scrapeFallback` and `next/image` `remotePatterns` for agents editing the events pipeline.
