# Sitebrief setup

## Local application

```sh
npm ci
npm run dev
```

Set server-only values in an ignored `.env.local`:

```dotenv
QLOO_API_KEY=
QLOO_API_URL=https://hackathon.api.qloo.com
GEMINI_API_KEY=
```

Never commit values or add a NEXT_PUBLIC prefix. Qloo uses X-Api-Key. Gemini2.5Flash is called directly by the server for bounded tool decisions and Google-grounded research. Custom briefs have no canned research fallback. The fixed playground demonstration can show an explicitly dated saved real reference run on provider failure; this is not presented as a new live request.

## Vercel

Use the existing collab-scout project. Set Preview and Production environment values, then redeploy after updates. Verify a real hosted request: environment configuration alone does not establish successful integration. Sensitive environment downloads may contain placeholders; a local placeholder probe cannot diagnose a deployed credential.

## Checks

```sh
npm test -- --runInBand
npm run lint
npm run build
```

Optional hosted-verification tools are Playwright/Chromium, axe-core, pdf-lib and the official MCP SDK. Scripts accept module-path overrides for isolated tool installations. See VALIDATION.md for the exact verified app and evidence; do not treat an old preview report as proof of a newer release.

## Quota status — deliberately deferred

This feature branch adds a shared global daily live-analysis budget. The default is 50 admitted top-level jobs per UTC day; set a lower or higher limit explicitly if needed. Each agent run is one job with its existing bounded provider/tool budget. Failed jobs still consume admission. Nested tools do not charge again. HTTP exploration, research, live comparison and scouting, plus MCP paid tool calls, all require shared admission. Discovery, fixed sample comparison and qualified cached/saved examples do not make sponsor calls and do not consume the budget.

Required **server-only** variables:

- `SITEBRIEF_REDIS_REST_URL`: dedicated HTTPS Redis REST endpoint.
- `SITEBRIEF_REDIS_REST_TOKEN`: dedicated store credential.
- `SITEBRIEF_DAILY_ANALYSIS_LIMIT`: optional integer, defaults to `50`.

A single Redis `EVAL` checks/increments the daily counter atomically and expires it at the next UTC midnight. Preview and Production use separate counter keys. Missing credentials, store errors and invalid replies fail closed before provider work. Never enable an in-memory fallback. Exhaustion returns 429 and a UTC-reset notice. The allowance is global, not a per-visitor promise or monetary spending cap. One caller can exhaust it; no accounts or billing are introduced.

**Configuration status:** no dedicated shared store existed at implementation start. No paid infrastructure or Production settings may be changed without separate authorization. Configure the approved dedicated store in Preview, verify atomic exhaustion/outage behavior, then repeat final hosted acceptance. Production activation and five cold Production runs happen only after an approved merge. Do not reuse another product’s database or secret.
