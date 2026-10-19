# Setup and deploy

For another agent (or a human) with Vercel access. Supabase is not required for this app.

## What this service is

Market Desk Taste Agent is a Next.js app that:

1. Accepts a research brief (`POST /api/taste-brief` or the no-login demo UI).
2. Calls Qloo (hackathon host only) to resolve brands/places, pull insights, tags, and comparisons.
3. Synthesizes a taste brief with Gemini 2.5 Flash, or a canned fallback if `GEMINI_API_KEY` is missing.

No database. No auth. Seeded briefs live in `seed/sample-briefs.json`.

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables (Production + Preview).

| Name | Required | Default | Purpose |
|---|---|---|---|
| `QLOO_API_KEY` | Yes for live Qloo | — | Hackathon key. Sent as `X-Api-Key`. Never commit. |
| `QLOO_API_URL` | No | `https://hackathon.api.qloo.com` | Hackathon base URL only. Staging/prod hosts will 401. |
| `QLOO_USE_MOCK` | No | unset | `true` forces the labelled mock fallback. Leave false/unset in prod. |
| `GEMINI_API_KEY` | No | — | Google Gemini key. If missing, synthesis uses the canned fallback. |
| `QLOO_TIMEOUT_MS` | No | `15000` | Per-request timeout. |
| `QLOO_CACHE_TTL_MS` | No | `600000` | In-memory response cache TTL (10 min). |
| `QLOO_MAX_RETRIES` | No | `2` | Retries on 429/5xx. |

Aliases still honored: `QLOO_BASE_URL` (= `QLOO_API_URL`), `USE_QLOO_MOCK` (= `QLOO_USE_MOCK`).

Do **not** set `OPENAI_API_KEY`. The runtime LLM is Gemini only.

## Local

```bash
cp .env.example .env.local
# put QLOO_API_KEY and optionally GEMINI_API_KEY in .env.local
npm install
npm test
npm run build
npm run dev -- --port 43123
```

Without `QLOO_API_KEY`, the app automatically uses the **labelled mock fallback**. Demo pages still work.

Live smoke (prints status + short summaries, never the key):

```bash
QLOO_API_KEY=... npm run qloo:smoke
```

Requires a real key and `QLOO_USE_MOCK` not `true`.

## How Qloo is used

Auth and host from the [hackathon developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide):

- Header: `X-Api-Key: <QLOO_API_KEY>` (not `Authorization: Bearer`)
- Host: `https://hackathon.api.qloo.com`
- Method: **GET** with query params (Insights is not POST)
- Do not call `/recommendations` or `/recs`

| Agent step | Endpoint | Typical params |
|---|---|---|
| Resolve brands/places | `GET /search` | `query`, `types=urn:entity:brand`, `take` |
| Audience affinities | `GET /v2/insights` | `filter.type=urn:entity:brand` or `urn:entity:place`, `signal.interests.entities`, `signal.location.query`, `signal.demographics.age`, `take` |
| Related tags | `GET /v2/tags` | `filter.query`, `take` |
| Taste tags for entities | `GET /v2/insights` | `filter.type=urn:tag`, `signal.interests.entities` |
| Demographic skew | `GET /v2/insights` | `filter.type=urn:demographics`, `signal.interests.entities` |
| Entity-group compare | `GET /v2/analysis/compare` | `a.signal.interests.entities`, `b.signal.interests.entities` |

## Vercel deploy

1. Import the Git repo into Vercel (Next.js, default build `npm run build`, output `.next`).
2. Add the env vars above. `QLOO_API_KEY` is the one that makes the demo live.
3. Deploy. Confirm `GET /api/taste-brief` returns `qloo_mode: "live"` and the hackathon base URL.
4. Open `/`, pick a seeded brief, generate a taste brief. No login.
5. Market Desk can `POST /api/taste-brief` with the research-brief JSON (`lib/agent/schema.ts`).

If `GET /api/taste-brief` shows `qloo_mode: "fallback_mock"`, the key is missing or `QLOO_USE_MOCK=true`.

## Demo steps (judges / no login)

1. Open the hosted homepage.
2. Choose a seeded brief (e.g. Sustainable Activewear).
3. Click **Generate Taste Brief**.
4. Confirm affinities, tags, differentiators, and survey questions cite Qloo entity/tag ids.
5. Optional: **Send to Market Desk** (deep link) or **Download JSON**.

## What is not in this repo

- The Qloo key itself
- Gemini key
- Market Desk private code
- Devpost submission / video

Deadline for the hackathon submission is Fri Oct 30, 2026, 11:45 PM ET. Hosting, video (optional; rules say no video required), and Devpost copy are still human steps.
