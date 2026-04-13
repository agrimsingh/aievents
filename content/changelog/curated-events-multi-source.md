---
title: Curated events support non-Luma sources
category: feature
createdAt: 2026-04-13T12:00:00.000Z
---

Curated listings now use `sourceUrl` instead of `lumaUrl`, with `curatedEvents` / `CuratedEventEntry` in `data/events.ts`. The fetch layer still parses JSON-LD `Event` / `SocialEvent` from each page; Luma-specific title suffix stripping runs only for Luma hosts.

Adds the AI Tinkerers Singapore “Agentic Future & Dev/Eng Workflows” meetup (singapore.aitinkerers.org). List and featured CTAs show “Luma” / “View on Luma” only for Luma URLs; other hosts get “Details” / “View event”. `next/image` allows `sloppy-joe-app.imgix.net` for that cover. `pickImage` accepts string, `{ url }`, and mixed arrays for broader JSON-LD.

Documentation in `README.md` and `AGENTS.md` is aligned with the multi-source pipeline.
