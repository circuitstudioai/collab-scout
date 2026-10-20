# Collab Scout

> **Agents, but with taste** — complementary co-marketing partners, powered by [Qloo](https://www.qloo.com/).

Canonical repo: [github.com/circuitstudioai/collab-scout](https://github.com/circuitstudioai/collab-scout). Working name lives in `lib/app-config.ts` (`APP_NAME`) so it is easy to rename.

For consumer brand founders. Not a market-research dashboard. **MIT.** Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/) (deadline Fri Oct 30, 2026, 11:45 PM ET). Hosted on **Vercel**.

---

## What it does

You describe a founder brand (name and/or 1–3 seed brands it resembles, category, geography, optional age, optional competitor exclusions). The agent:

1. Resolves seeds with `GET /search`
2. Pulls audience-overlap brands (and optional places/artists) with `GET /v2/insights`
3. Pulls shared tags (`GET /v2/tags` or insights `urn:tag`) and compare (`GET /v2/analysis/compare`)
4. **Drops direct competitors** (same category or your exclusions) and ranks the rest by affinity
5. Writes a concrete collab concept and a **draft** outreach pitch

Pitches are drafts only. The app **never sends email** and never contacts anyone. You can copy a draft and mark contacted / replied / declined in **this browser** (`localStorage`).

JSON: `POST /api/partners`. Demo: no login, three fictional consumer brands (not baby products).

---

## What makes it Qloo-powered

Auth and host follow the [hackathon developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide):

- Header: `X-Api-Key: <QLOO_API_KEY>` (not Bearer)
- Host: `https://hackathon.api.qloo.com`
- GET only. **Do not** call `/recommendations` or `/recs`

| Step | Endpoint |
|---|---|
| Resolve seeds | `GET /search?query=&types=urn:entity:brand&take=` |
| Overlap brands | `GET /v2/insights?filter.type=urn:entity:brand&signal.interests.entities=&signal.location.query=` |
| Venues / talent | `GET /v2/insights?filter.type=urn:entity:place` or `urn:entity:artist` |
| Shared tags | `GET /v2/tags` or `GET /v2/insights?filter.type=urn:tag` |
| Compare | `GET /v2/analysis/compare` |

Every demo run shows a **Qloo-powered trace** of those calls (entity ids, scores, tags).

---

## Run locally

```bash
cp .env.example .env.local
npm install
npm test
npm run build
npm run dev -- --port 43123
```

Without `QLOO_API_KEY` the labelled **mock fallback** runs so the demo still works.

```bash
QLOO_API_KEY=... npm run qloo:smoke
```

## Env

Set these locally in `.env.local`, and on **Vercel** under Project → Settings → Environment Variables (Production + Preview). Gemini is called **directly** from the Next.js server using `GEMINI_API_KEY` — there is no extra Gemini proxy.

| Var | Role |
|---|---|
| `QLOO_API_KEY` | Hackathon key → `X-Api-Key` (required for live Qloo) |
| `GEMINI_API_KEY` | Gemini 2.5 Flash; canned drafts if unset |
| `QLOO_API_URL` | Default `https://hackathon.api.qloo.com` |
| `QLOO_USE_MOCK` | `true` forces mock — leave unset on Vercel |

Product: [docs/PRD.md](docs/PRD.md). Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Deploy: [docs/SETUP.md](docs/SETUP.md). Devpost draft: [docs/devpost-draft.md](docs/devpost-draft.md).

## API

```http
POST /api/partners
{
  "brand_name": "Northline Provisions",
  "category": "specialty coffee",
  "seed_brands": ["Blue Bottle", "Stumptown"],
  "target_geography": "United States",
  "audience_age": "25-34",
  "exclude_brands": ["Starbucks"]
}
```
