# AI Events SG

Community calendar for Singapore’s AI scene — [aievents.sg](https://aievents.sg). Events are pulled from curated [Luma](https://lu.ma) URLs (`data/events.ts`) and hydrated via JSON-LD on each page.

## Stack

- Next.js 16 (App Router, ISR `revalidate: 3600`)
- Tailwind CSS v4
- Bricolage Grotesque + Figtree (via `next/font`)

## Dev

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Add an event

Edit [`data/events.ts`](data/events.ts): add a `{ sourceUrl, type?, tags? }` entry (Luma or any page with Event JSON-LD). Deploy or wait for the hourly revalidation.

## Deploy (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. [Import the project](https://vercel.com/new) in Vercel (framework: Next.js).
3. Deploy — no env vars required for the current Luma HTML fetch.

Build check:

```bash
pnpm build
```

## Scripts

| Command        | Action              |
| -------------- | ------------------- |
| `pnpm dev`  | Dev server (Turbopack) |
| `pnpm build` | Production build   |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint             |
