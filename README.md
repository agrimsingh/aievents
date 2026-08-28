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

## Slack-approved event intake

The optional Slack intake workflow publishes approved event links directly to `main`.

1. An allowlisted curator posts one event URL by itself in the configured Slack channel.
2. An allowlisted curator adds the `:white_check_mark:` reaction. Edited messages are ignored; post a fresh URL if it changes.
3. Slack sends the signed approval event to the site, which immediately starts the GitHub intake workflow. A staggered five-minute GitHub schedule remains as a best-effort fallback.
4. The workflow checks the channel, adds new approved URLs to [`data/slack-events.json`](data/slack-events.json), and commits the file to `main`.
5. The site deployment begins from that commit. To unpublish an event after it is committed, remove its entry from [`data/slack-events.json`](data/slack-events.json).

Only HTTPS URLs on the allowlist in [`scripts/slack-event-intake.mjs`](scripts/slack-event-intake.mjs) are accepted. The base list covers Luma, Meetup, GrowthX, and AI Tinkerers Singapore. Add unfamiliar hosts through code review rather than a repository variable, because the site fetches event URLs server-side.

### One-time setup

The repository owner or an administrator must:

1. Create a Slack app and install it to the 65Labs workspace with these bot token scopes:
   - `channels:history`
   - `groups:history` if the intake channel is private
   - `reactions:read`
2. Invite the Slack app to the intake channel.
3. Enable Slack Event Subscriptions with the production request URL `https://www.aievents.sg/api/slack/events`, then subscribe the bot to `reaction_added`.
4. Add the bot token as the GitHub Actions secret `SLACK_BOT_TOKEN`.
5. Add these GitHub repository variables:
   - `SLACK_TEAM_ID`: the immutable `T...` workspace ID
   - `SLACK_EVENT_CHANNEL_ID`: the immutable `C...` or `G...` channel ID
   - `SLACK_EVENT_APPROVER_IDS`: comma-separated `U...` Slack user IDs allowed to approve events
   - `SLACK_EVENT_APPROVAL_REACTIONS` (optional): defaults to `white_check_mark`
   - `SLACK_EVENT_LOOKBACK_DAYS` (optional): defaults to 30 and is capped at 90
6. Add these encrypted Vercel production environment variables:
   - `SLACK_SIGNING_SECRET`: the Slack app signing secret
   - `GITHUB_WORKFLOW_TOKEN`: a credential allowed to dispatch Actions for this repository
7. Add these Vercel production environment variables:
   - `SLACK_TEAM_ID`, `SLACK_APP_ID`, `SLACK_EVENT_CHANNEL_ID`, and `SLACK_EVENT_APPROVER_IDS`
   - `GITHUB_WORKFLOW_REPOSITORY`: `agrimsingh/aievents`
   - `GITHUB_WORKFLOW_REF`: `main`

The signed Slack webhook is the primary trigger. The workflow also polls at staggered five-minute intervals as a best-effort recovery path and can be started manually. It reads only recent channel history, verifies the bot belongs to the configured workspace, ignores bots and edited messages, requires both the submitter and approver to be allowlisted curators, removes query strings and fragments, and deduplicates URLs already present in either curated event file. An approval is a production publishing action with no pull-request preview. Approval reactions added after the configured lookback window are not discovered.

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
| `pnpm test` | Intake unit tests |
| `pnpm intake:slack` | Collect approved Slack event URLs |
