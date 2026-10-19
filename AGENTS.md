<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Market Desk Taste Agent

Public MIT repo for the Qloo Agentic Hackathon. Deploy notes: [docs/SETUP.md](docs/SETUP.md).

### Env

- `QLOO_API_KEY` — hackathon key; header `X-Api-Key` (never Bearer, never commit)
- `QLOO_API_URL` — default `https://hackathon.api.qloo.com` (alias `QLOO_BASE_URL`)
- `QLOO_USE_MOCK=true` — labelled mock fallback (also used if the key is missing)
- `GEMINI_API_KEY` — Gemini 2.5 Flash via `@google/genai`; canned fallback if unset

### Qloo (follow the developer guide exactly)

- Host: `https://hackathon.api.qloo.com` only
- Auth: `X-Api-Key`
- GET `/search`, GET `/v2/insights`, GET `/v2/tags`, GET `/v2/analysis/compare`
- Insights is **GET + query string**, not POST JSON
- Do not call `/recommendations` or `/recs`
- Cache responses in memory; retry 429; timeout ~15s

### Demo

1. `npm install && npm test && npm run build`
2. `npm run dev -- --port 43123` — no login; pick a seeded brief
3. Live check: `npm run qloo:smoke` (needs `QLOO_API_KEY`; does not print the key)
4. Health: `GET /api/taste-brief` → `qloo_mode` should be `live` when the key is set

### Do not

- Hardcode keys
- Publish/submit Devpost
- Copy Market Desk private code
- Add a database or auth unless asked
