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

## Shared quota — Vercel Marketplace Upstash Redis, Free only

The owner selected **Upstash for Redis through Vercel Marketplace**, Free plan only, US East (`iad1`). No paid plan, upgrade, production app deployment or merge is authorized. Supabase is no longer used for quota; the un-applied SQL migration and its local proof script have been removed. Historical PostgreSQL receipts do not prove Redis acceptance.

Use the existing Vercel project `collab-scout` in `circuitstudioais-projects`. CLI discovery confirms product `upstash/upstash-kv`, plan `free`, and metadata below. The owner accepted Marketplace terms on October 24. Dedicated resource `sitebrief-quota` (`store_GsZwpkM7ic7yWpSk`) is now provisioned on verified Free in `iad1`, with `autoUpgrade=false`, `eviction=false`, and `prodPack=false`. It is connected to Preview and Production. Sensitive `SITEBRIEF_REDIS_REST_URL` and `SITEBRIEF_REDIS_REST_TOKEN` aliases are configured for both targets. Do not create a duplicate resource or substitute a paid plan. Hosted quota proof passed; the five-run research gate remains incomplete (4/5). See the latest checkpoint in `docs/final-features/README.md`.

After confirming no duplicate resource exists, the authorized setup is:

```sh
vercel integration add upstash/upstash-kv --scope circuitstudioais-projects \
  --plan free --name sitebrief-quota \
  --metadata primaryRegion=iad1 --metadata autoUpgrade=false \
  --metadata eviction=false --metadata prodPack=false \
  --environment preview --environment production --no-env-pull
```

Verify the actual resource plan, region, disabled auto-upgrade and **no eviction** after creation. If Free is unavailable or flags cannot be confirmed, stop; never provision Pay As You Go. Do not borrow another product's data or credential.

The adapter accepts complete **server-only** variable pairs, in priority order:

1. `SITEBRIEF_REDIS_REST_URL` / `SITEBRIEF_REDIS_REST_TOKEN`
2. `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
3. `KV_REST_API_URL` / `KV_REST_API_TOKEN`

Use the HTTPS `*.upstash.io` REST origin and **write-capable** REST token, not the read-only token or Redis connection string. Store values as Sensitive Vercel variables for Preview and Production. Never add `NEXT_PUBLIC_`, commit values, display downloaded environments, or send tokens in reports. A partially supplied higher-priority pair fails closed; the adapter never mixes credentials across pairs. Redirects are refused. Redis error details and secrets are not returned to callers.

The application fixes the allowance at **50 top-level live jobs per UTC day per environment**; request data and environment overrides cannot increase it. One atomic Lua `EVAL` uses Redis `TIME`, checks the stored UTC day, and increments only when admitted. An environment-specific hash (`sitebrief:budget:v2:preview` or `:production`) expires at the next Redis UTC midnight. Old-day state also rolls over in the script; no cron is needed. No IPs, briefs or visitor identities are stored. Do not delete counters, enable eviction, change keys, swap databases or lower persistence during an active quota day: losing state resets consumption. A backend/provider administrator can alter state; this is not a provider billing cap.

Each top-level live job consumes one admission, including failed jobs. Nested tools do not charge again. All paid HTTP routes and MCP calls require admission. Fixed samples, discovery and qualified saved/cached examples avoid new provider work and remain unmetered. Missing configuration, store outages, invalid state/replies and read-only tokens fail closed. Exhaustion returns 429 with Retry-After based on Redis UTC time. No process-local fallback exists.

### Verification and deployment boundaries

```sh
npx tsx scripts/verify-redis-quota.ts
```

Requires local `redis-server` and `redis-cli` (or `REDIS_SERVER_BIN` / `REDIS_CLI_BIN`). Starts its own temporary Unix-socket-only Redis, with no TCP port, persistence or hosted URI. Proves atomic admission, exhaustion without overshoot, UTC expiry, previous-day rollover, environment isolation, invalid-state denial, preservation of unrelated data and adapter outage handling. The application adapter uses a local transport bridge to real Redis EVAL; this is **not hosted Upstash REST proof**. It does not simulate passage through midnight; it seeds previous-day state and checks exact UTC expiry.

After storage/settings exist, deploy **Preview only**, prove hosted REST concurrency/exhaustion/reset/outage semantics with isolated verification counters, then repeat five fresh full-head integrated Preview runs and final UI/PDF checks. Never exhaust or reset the real production counter for a test. Production storage/env connection is authorized; production **app deployment**, merge, launch and submission remain separate gates. Missing mapped-store counts may explicitly display Unavailable and are not a release blocker under the owner's October 24 decision.
