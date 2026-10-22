# Current restaurant setup

See root README and `SCOUT_AGENT.md` for the active restaurant agent, MCP and verification. Set server-only QLOO_API_KEY, QLOO_API_URL and GEMINI_API_KEY, then redeploy. The following Collab Scout setup is historical: its partnership routes, orchestrator and seed product were removed. There is no active canned research fallback.

# Setup and deploy

Canonical repo: [github.com/circuitstudioai/collab-scout](https://github.com/circuitstudioai/collab-scout).

For another agent (or a human) with **Vercel** access. Import that GitHub repo into Vercel (Next.js). No database. No auth. No Supabase required.

Gemini is called **directly** from the Next.js server using `GEMINI_API_KEY` from Vercel environment variables (same settings page as `QLOO_API_KEY`). There is no Gemini proxy or extra vendor.

## What this is

**Collab Scout** (`APP_NAME` in `lib/app-config.ts`) finds complementary co-marketing partners from Qloo taste overlap. Demo is no-login. Outreach is draft-only and never sent.

1. Founder brief → `POST /api/partners` or `/scout/[id]`
2. Qloo GET loop (`/search`, `/v2/insights`, `/v2/tags`, `/v2/analysis/compare`)
3. Competitor filter + affinity rank
4. Gemini 2.5 Flash or canned collab concepts + pitch drafts

Seeded fictional brands: `seed/sample-brands.json`.

## Environment variables

| Name | Required | Default | Purpose |
|---|---|---|---|
| `QLOO_API_KEY` | Yes for live Qloo | — | Hackathon key. `X-Api-Key`. Never commit. |
| `QLOO_API_URL` | No | `https://hackathon.api.qloo.com` | Hackathon host only |
| `QLOO_USE_MOCK` | No | unset | `true` forces labelled mock fallback |
| `GEMINI_API_KEY` | No | — | Gemini 2.5 Flash; canned fallback if missing |
| `QLOO_TIMEOUT_MS` | No | `15000` | Per-request timeout |
| `QLOO_CACHE_TTL_MS` | No | `600000` | In-memory cache TTL |
| `QLOO_MAX_RETRIES` | No | `2` | 429/5xx retries |

Aliases: `QLOO_BASE_URL`, `USE_QLOO_MOCK`. Do not set `OPENAI_API_KEY`.

## Local

```bash
cp .env.example .env.local
npm install
npm test
npm run build
npm run dev -- --port 43123
QLOO_API_KEY=... npm run qloo:smoke
```

No key → mock fallback; demo still works.

## How Qloo is used

- Header: `X-Api-Key`
- Host: `https://hackathon.api.qloo.com`
- GET query params only. No `/recommendations` or `/recs`

| Agent step | Endpoint |
|---|---|
| Resolve seeds | `GET /search` |
| Overlap brands / places / artists | `GET /v2/insights` (`filter.type=urn:entity:brand\|place\|artist`) |
| Tags | `GET /v2/tags` or `GET /v2/insights?filter.type=urn:tag` |
| Compare | `GET /v2/analysis/compare` (+ demographics insights) |

## Vercel

1. Import [circuitstudioai/collab-scout](https://github.com/circuitstudioai/collab-scout) into Vercel (Next.js, Framework Preset Next.js, build `npm run build`, output `.next`).
2. In Vercel → Project → Settings → Environment Variables, set at least:

   | Name | Production + Preview |
   |---|---|
   | `QLOO_API_KEY` | Hackathon key (required for live Qloo) |
   | `GEMINI_API_KEY` | Google Gemini key (direct `@google/genai` call; omit to use canned drafts) |
   | `QLOO_API_URL` | `https://hackathon.api.qloo.com` |

   Leave `QLOO_USE_MOCK` unset (or `false`). Do not set `OPENAI_API_KEY`.
3. Redeploy after adding env vars. Confirm `GET /api/partners` shows `qloo_mode: "live"` and `gemini: "gemini-2.5-flash"` when both keys are set.
4. Open `/`, pick a seeded fictional brand, run scout. Trace panel must list Qloo GETs.

## Demo steps (judges)

1. Homepage — three fictional founders (coffee, home scent, ceramics).
2. Open one → Find complementary partners.
3. Confirm competitors are filtered, pitches say DRAFT, copy works, local status works.
4. Open the Qloo-powered trace.

## Not in this repo

- API keys
- Devpost submit / video
- Any Market Desk code or deep link

Deadline: Fri Oct 30, 2026, 11:45 PM ET.

## Verify deployed credentials, not redacted downloads

Vercel environment downloads can contain placeholder representations of sensitive values. A local call using such a placeholder does not test the deployed credential. Verify server-side integration on a fresh deployment before reporting an invalid saved key. On October22, a local placeholder probe failed while the freshly deployed research endpoint successfully returned grounded Gemini research. Never print credentials while diagnosing this difference.
