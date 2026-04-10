<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Use **pnpm** for dependency installs and script invocations in this repo (not npm).
- For UI and layout work, hold a **high design bar** (distinctive, production-grade; aligns with impeccable / strong frontend-design expectations—not generic template or aggregator aesthetics).
- **Avoid brown-heavy palettes**; user requested UI direction away from brown/chocolate tones—pick another cohesive system (e.g. OKLCH-based) that still fits the brand.
- Before substantial visual redesigns, check **`.impeccable.md`** in the project root for agreed design context when it exists.

## Learned Workspace Facts

- **aievents.sg**: Singapore-focused **AI community events** listing; curated, community-run feel; tied to **65labs.org**.
- **65labs branding**: Prefer **`/65labs.png`** from `public` as the logo where used, linking to **https://65labs.org**.
- **Source repo**: **https://github.com/agrimsingh/aievents** (default branch **`main`**).
- **Hosting**: **Vercel**; install/build follow **`pnpm-lock.yaml`** when configuring the project.
- **Stack**: **Next.js 16**, **Tailwind CSS v4**, **Bricolage Grotesque** + **Figtree**; listings use **ISR** with roughly **hourly** revalidation for Luma-backed data.
- **Events pipeline**: Curated **Luma** URLs in **`data/events.ts`**; **`lib/luma.ts`** loads event details from each page via **JSON-LD Event** (and related fields) in the HTML.
- **Roadmap note**: **Convex** for community submissions and an approval workflow was discussed as a later phase alongside curated Luma-sourced events.
