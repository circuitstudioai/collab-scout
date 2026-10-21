<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Collab Scout

Qloo Agentic Hackathon entry. Canonical repo: [github.com/circuitstudioai/collab-scout](https://github.com/circuitstudioai/collab-scout). Name: `APP_NAME` in `lib/app-config.ts`. Product: [docs/PRD.md](docs/PRD.md). Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Deploy: [docs/SETUP.md](docs/SETUP.md) (Vercel). Devpost draft: [docs/devpost-draft.md](docs/devpost-draft.md).

Co-marketing partner agent for consumer brand founders. **Not** a Market Desk / taste-brief / survey tool. Never send email. Never depend on Market Desk.

### Env

Set locally in `.env.local`. On Vercel, set the same names in Project → Settings → Environment Variables.

- `QLOO_API_KEY` — header `X-Api-Key` (never Bearer, never commit)
- `GEMINI_API_KEY` — Gemini 2.5 Flash, called directly with this key; canned fallback if unset
- `QLOO_API_URL` — default `https://hackathon.api.qloo.com`
- `QLOO_USE_MOCK=true` — labelled mock fallback (also if key missing); leave unset on Vercel

### Qloo

- GET `/search`, `/v2/insights`, `/v2/tags`, `/v2/analysis/compare`
- Insights is GET + query string
- No `/recommendations` or `/recs`
- Cache in memory; retry 429; timeout ~15s

### Demo

1. `npm test && npm run build`
2. `npm run dev -- --port 43123` — no login; pick a seeded fictional brand
3. `npm run qloo:smoke` needs a live key; does not print it
4. Health: `GET /api/partners`

### Do not

- Hardcode keys
- Publish or submit Devpost
- Reintroduce Market Desk deep links
- Auto-email partners

## Deployment

Infrastructure checkpoint: 2026-10-20.

- Production: https://collab-scout.vercel.app
- Vercel project: `collab-scout` in `circuitstudioais-projects`.
- Git integration: this repository, production branch `main`, repository root, Next.js, Node.js 24.
- Production and Preview environment names configured: `GEMINI_API_KEY`, `QLOO_API_URL`.
- `GEMINI_API_KEY` is a server-side key; Gemini is called directly, not through AI Gateway.
- `QLOO_USE_MOCK` is unset. `QLOO_API_KEY` is still required in Production and Preview.
- Initial production deployment of `d1b521ae625fb9eff1e78d7760480a28ca6f6148` succeeded.
- Verified: homepage HTTP 200; `GET /api/partners` reports `operational`, `fallback_mock`, and `gemini-2.5-flash`; an empty brief is rejected with HTTP 400.
- The Gemini health label confirms configuration only; successful generation is not yet verified.
- Live Qloo acceptance is **blocked**, not passed. Set `QLOO_API_KEY`, redeploy, verify `qloo_mode: live`, and complete the fictional-brand smoke test with real Qloo trace entries, concepts, and a pitch draft.
- No outreach was sent, database created, paid plan enabled, or Devpost submission made.
