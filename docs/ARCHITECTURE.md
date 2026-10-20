# Architecture — Collab Scout

Next.js (App Router) + TypeScript on Vercel. No database, no auth, no Supabase in the current tree. Gemini is called **directly** from the Next.js server with `GEMINI_API_KEY`. Qloo is GET-only against the hackathon host.

Read `docs/PRD.md` for product scope. This file describes what is in the repo today.

## Components

```
Browser UI (app/)
    │  POST /api/partners  { partner brief }
    ▼
API route (app/api/partners/route.ts)
    │  parsePartnerBrief (zod) → scoutPartners
    ▼
Orchestrator (lib/agent/orchestrator.ts)
    │
    ├─► Gather loop (lib/agent/gather.ts)
    │       ▼
    │   Qloo client (lib/qloo/client.ts)
    │       ├─ in-memory TTL cache (lib/qloo/cache.ts)
    │       ├─ GET + retries/timeout (lib/qloo/http.ts)
    │       └─ labelled mock (lib/qloo/mock.ts) if no key / QLOO_USE_MOCK
    │
    ├─► Filter + rank (lib/agent/rank.ts) via cannedPartnerShortlist
    │
    └─► Gemini 2.5 Flash (lib/agent/gemini.ts)
            or canned drafts (lib/agent/canned.ts) if key missing or call fails
```

- **UI** — `/` lists three seeded fictional brands. `/scout/[id]` runs a seeded brief. `/scout/custom` collects a brief, then the same runner. `ScoutRunner` posts JSON, renders cards, copies drafts, writes outreach status to `localStorage`, and shows `qloo_trace`.
- **API** — `POST /api/partners` scouts; `GET /api/partners` is a health document (`qloo_mode`, `gemini`, disclaimer). `app/api/taste-brief/route.ts` is retired (410).
- **Agent** — fixed Qloo GET sequence (not a single prompt). Named tool wrappers with Zod schemas live in `lib/agent/tools.ts`; the live path calls `getQlooClient()` from `gather.ts`. After signals return, `cannedPartnerShortlist` filters/ranks and builds cards; Gemini may rewrite summary / why / concept / pitch only.
- **Qloo** — `X-Api-Key`, host `https://hackathon.api.qloo.com` (or `QLOO_API_URL` / `QLOO_BASE_URL`). Endpoints: `/search`, `/v2/insights`, `/v2/tags`, `/v2/analysis/compare`. Insights is GET + query string. Responses normalized in `lib/qloo/map.ts`.

## Data flow

1. **UI → API.** Founder brief (`brand_name`, `category`, `target_geography`, optional seeds / age / exclusions) `POST /api/partners`. Invalid body → 400. Uncaught scout failure → 500. Route `maxDuration` is 60s.
2. **API → Qloo client.** `runScoutLoop`:
   - Search founder name + up to three seeds (`types=urn:entity:brand`, take 3).
   - Insights: brands (16), places (8), artists (6), with `signal.interests.entities`, `signal.location.query`, optional `signal.demographics.age`.
   - Tags: insights `urn:tag` when entity ids exist, else `GET /v2/tags?filter.query=`.
   - Compare seeds vs up to four candidate partner ids; also records a demographics insights step on the trace.
3. **Cache / retries / mock.** Live GETs go through `cachedGet` (in-memory TTL, default 10 minutes, max 100 entries; Qloo allows private server-side cache — do not persist responses in the repo). `qlooGet` times out (~15s), retries 429/502/503/504 (and transport/timeouts) with backoff / `Retry-After`. Search 404 → empty results. Missing key or `QLOO_USE_MOCK=true` → `MockQlooClient` (labelled fallback).
4. **Rank.** Drop seeds, exclusions, same-category brands; keep complementary brands plus places/artists; sort by score.
5. **Gemini or canned.** No `GEMINI_API_KEY` or Gemini error → canned shortlist. Success → merge rewritten copy onto the same partner ids/names/scores. Gemini must not invent partners.
6. **UI.** Shortlist + filtered-out list + trace. Outreach status keys: `collab-scout:outreach:{runId}:{partnerId}` (`APP_SLUG`). Never emailed.

## Key files and directories

| Path | Role |
|---|---|
| `lib/app-config.ts` | `APP_NAME`, `APP_SLUG`, tagline, theme |
| `app/page.tsx` | Homepage + seeded cards |
| `app/scout/[id]/page.tsx` | Seeded scout or `custom` |
| `app/scout/[id]/ScoutRunner.tsx` | Client runner, copy, localStorage, trace |
| `app/scout/[id]/CustomScoutForm.tsx` | Custom brief form |
| `app/api/partners/route.ts` | Scout + health |
| `app/api/taste-brief/route.ts` | 410 gone |
| `lib/agent/schema.ts` | Brief / card / trace / shortlist types + zod parse |
| `lib/agent/gather.ts` | Qloo GET loop + traces |
| `lib/agent/tools.ts` | Named Qloo tool wrappers (same client) |
| `lib/agent/rank.ts` | Competitor filter + affinity sort |
| `lib/agent/canned.ts` | Deterministic cards + DRAFT pitches |
| `lib/agent/gemini.ts` | `@google/genai`, `gemini-2.5-flash` |
| `lib/agent/orchestrator.ts` | gather → canned → optional Gemini merge |
| `lib/qloo/config.ts` | Host, header, endpoints, env resolvers |
| `lib/qloo/client.ts` | Live + mock switch, cached GET |
| `lib/qloo/http.ts` | Authenticated GET, retries |
| `lib/qloo/cache.ts` | In-memory TTL |
| `lib/qloo/mock.ts` | Labelled fallback data |
| `lib/qloo/map.ts` | Normalize Qloo JSON |
| `lib/qloo/errors.ts` | `QlooApiError`, retryable statuses |
| `seed/sample-brands.json` | Three fictional demo brands |
| `scripts/qloo-smoke.ts` | Live GET smoke; does not print the key |
| `tests/` | Client, map, rank, scout (mock) |
| `docs/SETUP.md` | Local + Vercel |
| `docs/devpost-draft.md` | Submission draft — do not submit |
| `uploads/qloo-plan_6717.md` | Pre-pivot plan + official rules/deadline |

## Environment variables (names only)

Set locally in `.env.local`. On Vercel: Project → Settings → Environment Variables (Production + Preview). **Never commit values. Never print keys.**

| Name | Role |
|---|---|
| `QLOO_API_KEY` | Hackathon key → `X-Api-Key` (required for live Qloo) |
| `QLOO_API_URL` | Default `https://hackathon.api.qloo.com` |
| `QLOO_BASE_URL` | Alias for the same host |
| `QLOO_USE_MOCK` | `true` forces labelled mock |
| `USE_QLOO_MOCK` | Legacy alias of the mock flag |
| `GEMINI_API_KEY` | Direct Gemini 2.5 Flash; canned if unset |
| `QLOO_TIMEOUT_MS` | Per-request timeout (default 15000) |
| `QLOO_CACHE_TTL_MS` | In-memory cache TTL (default 600000) |
| `QLOO_MAX_RETRIES` | 429/5xx retries (default 2) |

Do not set `OPENAI_API_KEY`. Leave `QLOO_USE_MOCK` unset on Vercel for live mode.

## Error handling

| Case | Behavior |
|---|---|
| Invalid partner brief | `400` `{ error, details }` |
| Scout throw | `500` `{ error, message }`; logged |
| No `QLOO_API_KEY` / mock flag | Labelled mock client; trace `mocked: true`; health `qloo_mode: fallback_mock` |
| Qloo 404 on `/search` | Empty results (fictional names often miss; seeds can still resolve) |
| Qloo 429 / 502 / 503 / 504 | Retry with backoff or `Retry-After` |
| Qloo timeout / transport | Retry; then `QlooApiError` |
| Other Qloo non-OK | Throw `QlooApiError` (not retried unless retryable) |
| No `GEMINI_API_KEY` | Canned drafts; health `gemini: canned_fallback` |
| Gemini empty/fail | Warn + canned shortlist |
| `/api/taste-brief` | `410 gone` |

Smoke: `QLOO_API_KEY=... npm run qloo:smoke` — prints key **length**, never the value.

## How to extend

Keep the product a co-marketing scout. See `AGENTS.md` “Do not” list.

- **Rename** — change `APP_NAME` / `APP_SLUG` in `lib/app-config.ts`.
- **Seeded demos** — add rows to `seed/sample-brands.json` (fictional consumer brands; not baby products). `generateStaticParams` already maps ids + `custom`.
- **Brief fields** — `lib/agent/schema.ts` then `CustomScoutForm` / README example. `audience.gender` exists on Qloo request types but the UI does not collect it.
- **Qloo steps** — add a client method + `QLOO_ENDPOINTS` entry, call it from `gather.ts`, append a `QlooTraceEntry`. Do not add `/recs` or `/recommendations`. Same operations can be exposed on `lib/agent/tools.ts` if something starts calling those wrappers.
- **Filter rules** — `CATEGORY_GROUPS` and `classifyCandidate` in `lib/agent/rank.ts`. Cover with `tests/rank.test.ts`.
- **Copy / concepts** — canned templates in `lib/agent/canned.ts`; Gemini system instruction in `lib/agent/orchestrator.ts` (keep “do not invent partners or scores”).
- **Persistence** — outreach is `localStorage` only. A later Circuit Studio-standard move would be Supabase Auth + DB (`docs/PRD.md` roadmap). Do not add a mailer.
- **Verify** — `npm test && npm run build`; `npm run dev -- --port 43123`; live key → `npm run qloo:smoke`.
