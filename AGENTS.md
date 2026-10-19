<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Collab Scout

Qloo Agentic Hackathon entry. Name: `APP_NAME` in `lib/app-config.ts`. Deploy: [docs/SETUP.md](docs/SETUP.md). Devpost draft: [docs/devpost-draft.md](docs/devpost-draft.md).

Co-marketing partner agent for consumer brand founders. **Not** a Market Desk / taste-brief / survey tool. Never send email. Never depend on Market Desk.

### Env

- `QLOO_API_KEY` — header `X-Api-Key` (never Bearer, never commit)
- `QLOO_API_URL` — default `https://hackathon.api.qloo.com`
- `QLOO_USE_MOCK=true` — labelled mock fallback (also if key missing)
- `GEMINI_API_KEY` — Gemini 2.5 Flash; canned fallback if unset

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
