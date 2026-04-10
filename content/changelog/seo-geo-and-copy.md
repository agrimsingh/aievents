---
title: SEO, structured data, and page copy
category: improvement
createdAt: 2026-04-10T14:30:00.000Z
---

Adds `sitemap.xml` and `robots.txt`, generated Open Graph and Twitter preview images, and richer global metadata (including `lang="en-SG"` and keyword hints). Home page JSON-LD now includes Organization (65labs), WebSite, ItemList, FAQPage, and per-event organizers, alongside existing Event entities.

Introduces visible “What this is” and “Questions” sections backed by shared copy in `lib/site-content.tsx` so FAQ answers stay aligned with FAQPage markup. Copy across the hero, footer, filter empty state, and social image is tightened to read more naturally; the main content landmark wraps intro, feed, and FAQ.

Updates the favicon asset.
