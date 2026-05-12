# AI Events SG

Community calendar for Singapore’s AI scene — [aievents.sg](https://aievents.sg). Events are pulled from curated event URLs (`data/events.ts`) and hydrated via JSON-LD on each page.

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

## Public API

`GET /api/v1/events` returns the event feed as JSON. It is unauthenticated, CORS-readable, and cached with `s-maxage=3600`.

Query parameters:

| Param | Default | Values |
| --- | --- | --- |
| `status` | `upcoming` | `upcoming`, `past`, `all` |
| `type` | none | Event kind id or label, e.g. `meetup`, `hackathon`, `Demo Day` |
| `platform` | none | `luma`, `meetup`, `growthx`, `other` |
| `tag` | none | Exact tag match, case-insensitive |
| `q` | none | Case-insensitive text search across title, description, location, tags, hosts, and URL |
| `from` | none | ISO timestamp or `YYYY-MM-DD` in Singapore time |
| `to` | none | ISO timestamp or `YYYY-MM-DD` in Singapore time |

Response contract:

- Events are always sorted by `startAt` ascending. The response includes `sort: { field: "startAt", direction: "asc" }`.
- The endpoint is intentionally unpaginated. Treat each response as a complete snapshot of the selected filter set; `pagination.mode` is `none`.
- For downstream sync, request `status=all`. Compare IDs with the previous `status=all` snapshot; an ID missing from the latest snapshot should be treated as removed. If source cancellation or tombstone data is added later, `status=all` is the compatibility path that will include those records.
- `updatedAt` is the response generation time. If a source platform exposes reliable edit timestamps later, add a separate `sourceUpdatedAt` field instead of changing this meaning.

Minimal item shape:

```json
{
  "id": "HermesNight",
  "slug": "HermesNight",
  "name": "Hermes Night",
  "type": "Meetup",
  "typeId": "meetup",
  "startAt": "2026-05-15T12:00:00.000Z",
  "endAt": "2026-05-15T15:30:00.000Z",
  "timezone": "Asia/Singapore",
  "location": "Register to see address",
  "locationVisibility": "registration_required",
  "hosts": [{ "name": "Clawbsters", "avatar": "https://...", "url": "https://..." }],
  "coverUrl": "https://...",
  "description": "Plain text description",
  "url": "https://luma.com/HermesNight",
  "platform": "Luma",
  "status": "published",
  "tags": ["Hermes", "agents", "personal AI"],
  "updatedAt": "2026-05-10T03:00:00.000Z"
}
```

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
