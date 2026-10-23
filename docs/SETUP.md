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

This PR does not add per-visitor quotas or provision shared storage. Existing per-instance concurrency counters do not stop repeated/distributed use. The approved future allowance is three briefs per visitor daily; shared counter storage, a global allowance, MCP authentication and cross-route enforcement remain a separate change. No paid service or global cap is assumed.

Future setup: connect a reviewed Redis REST store in Vercel; configure server-only store URL/token, a visitor-signing secret, MCP token and owner-chosen daily ceiling; complete the separate integration; verify denial across instances before deployment. Do not deploy an incomplete gate or claim an in-memory counter provides this protection.
