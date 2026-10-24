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

This feature branch uses an existing approved Supabase project for the shared global daily live-analysis budget. No Redis, Upstash, Edge Function, scheduled task, new project or paid add-on is required. The owner has prohibited extra spending.

Apply `supabase/migrations/20261024001000_sitebrief_quota.sql` only after confirming the intended existing project. This additive migration creates a private `sitebrief_quota` schema with `policies` and `daily_usage`, and one server-only public RPC, `sitebrief_reserve_live_analysis`. It does not alter unrelated tables, Auth, Storage, billing or plan configuration. Tables have RLS enabled and no API-role direct grants. Anonymous/authenticated users cannot execute the RPC. Only `service_role` can invoke it; the definer function has a fixed empty search path and qualified objects.

Required **server-only** variables:

- `SITEBRIEF_SUPABASE_URL`: the approved project’s canonical HTTPS `*.supabase.co` origin.
- `SITEBRIEF_SUPABASE_SECRET_KEY`: preferably a dedicated `sb_secret_...` backend key. A legacy service-role JWT is supported. Never use a publishable/anon key or a `NEXT_PUBLIC_` prefix.

The secret is sent on the `apikey` header; a legacy service-role JWT also uses Bearer authorization. Redirects are refused so the key cannot be forwarded to a different endpoint. The key authorizes project-wide elevated access: store it only in encrypted server settings and never in evidence, client bundles or logs. The actual quota tables remain inaccessible directly through API roles.

The database—not HTTP inputs or application environment variables—owns the UTC day and the limit. `sitebrief_quota.policies` defaults to 50 jobs per UTC day independently for `preview` and `production`. Changing a limit is an operator SQL action; the RPC cannot set a custom day or allowance. An atomic conditional upsert admits/increments or denies without overshooting. Each day uses a new key, so no reset cron is required. Only two small counters per day are stored; no visitor IPs, user identities or briefs are retained.

Each top-level live job consumes one admission, including failures. Nested agent tools do not charge again. All paid HTTP routes and MCP calls require admission. Fixed samples, discovery and qualified saved/cached examples do not call sponsors and are unmetered. Missing credentials, unavailable storage and malformed replies fail closed. Exhaustion returns 429 with the database UTC reset. This is a global allowance, not a per-visitor guarantee or exact currency cap.

**Deployment boundary:** existing project identity is pending from the owner. Do not guess from another product’s name or borrow its credential. Check current plan/usage before installation; creating quota objects must not trigger a new project or paid upgrade. Configure Preview only, prove live atomic admission/permissions/outages, then repeat five fresh integrated runs. Production changes and merge remain separately gated.

Local database verification: `python3 scripts/verify-supabase-quota.py` exercises the migration on the isolated local PostgreSQL test database only. It proves concurrency, API-role denial, independent environment/day counters, safe reapplication and preservation of an unrelated fixture. It cannot target a hosted project.
