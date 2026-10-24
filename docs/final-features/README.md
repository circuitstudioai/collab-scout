# Vercel Marketplace Redis continuation — October 24

Latest owner direction replaces the Supabase adapter with **Upstash Redis via Vercel Marketplace, Free only**, US East, no auto-upgrade or eviction. Limit remains 50/day per environment. Server-only Sensitive configuration may connect Preview and Production; Production app deployment, merge and submission remain gated.

**Current checks: 153 tests / 27 suites, lint and production build pass.**

Current local Redis proof passed: 3 of 12 concurrent EVAL calls admitted at limit 3; no exhaustion increments; exact UTC expiration; previous-day rollover; environment isolation; corrupt-state denial; unrelated fixture preserved. The application adapter over real local EVAL admitted exactly 50 of 64 attempts, denied 14 with 429, and failed closed on outage. This bridge is not hosted Upstash REST or integrated Preview proof. See [setup](../SETUP.md) and `scripts/verify-redis-quota.ts`.

Vercel CLI confirms a Free plan and the requested metadata but installation stops at required **human Marketplace terms acceptance**. No resource or hosted settings were created. Five fresh full-head integrated Preview runs and final UI/PDF acceptance remain pending configuration. Missing mapped counts may show Unavailable; owner explicitly deferred provider reliability as a blocker.

The Supabase continuation at `1fdbcd8` passed 146 tests and real local PostgreSQL checks. It was never configured/applied remotely and is superseded, not Redis evidence. The earlier Redis checkpoint below is retained as historical evidence for commit `841bbe1`, not the current adapter/configuration contract.

## Current remaining gates

1. Owner accepts Marketplace terms. Retry Free-only install with no auto-upgrade/eviction and verify actual plan/metadata; configure Sensitive server REST settings for Preview and Production.
2. Prove hosted REST concurrency, exhaustion, reset and outage handling with isolated verification counters. Local Redis and mocked HTTP replies are not hosted evidence.
3. Run five fresh full-head integrated Preview analyses and final UI/PDF checks. Do not count saved/cache responses as fresh or infer live success from deployment checks.
4. Present the draft for review. Merge, Production app deployment and submission remain unapproved.

## Historical original final feature push — `841bbe1` review checkpoint

## Release state

**Not ready to merge.** Shared quota configuration and final integrated live acceptance remain blocked. No Production settings, deployment promotion, merge or submission was performed.

- Four structured research fields, field-level provider grounding, one bounded retrieval retry, and schema-constrained exact-excerpt extraction on Gemini 2.5 Flash. No sentence-deletion filters were added.
- Required agent research priorities/focus appear in actual tool events. Visit ID/coordinates, deterministic rank/ties and popularity-floor rules remain enforced.
- Scout/Maybe verdicts, real Skip examples, source chips, verdict-coloured map markers, structured research, fixed City/landlord questions, dated provenance, real progress, Blue Bottle lead and secondary playground example.
- One-page PDF and notes retain verdicts, matching research sources, dates and the checklist. A compact, dated Blue Bottle fallback passes the same quality gate; custom requests never receive it.
- OSM mapped category counts are descriptive, nullable and separate from ranking. One union query serves the shortlist alongside agent work. Failure never becomes zero. Public-provider reliability is currently poor; see [pilot](../store-count-pilot.md).
- Atomic shared Redis admission guards all paid public HTTP routes and MCP tool calls. Default global allowance: 50 top-level jobs / UTC day, configurable. No per-visitor or authenticated-identity promise. Missing storage fails closed. No dedicated store is configured; no paid service was provisioned.
- A second bounded reverse lookup and a Qloo-provided street-address fallback avoid invented neighbourhood labels. Coordinates remain the final honest fallback.

## Measured evidence

1. Unit/integration suite: **144 tests / 27 suites pass**, plus lint, TypeScript via build and production build. These include quota fail-closed routes, atomic command contract, malformed replies, sample/discovery exemption, geography identity, source membership, field preservation, alias handling and source-only recovery. Redis service-side Lua execution has **not** been live-tested against a configured store.
2. Research-only isolation Preview: [ojv1b6nfs](https://collab-scout-ojv1b6nfs-circuitstudioais-projects.vercel.app) returned **5/5 fresh uncached Blue Bottle runs** with ≥3 filled fields and ≥2 distinct source URLs for the visit ID/coordinates. Field counts: 3, 3, 4, 3, 3. Durations: 27.527, 24.805, 16.828, 25.199, 17.644 seconds. This isolates new research/agent code on PR #9 HTTP handlers **before quota integration**; it is not final-head, Production, fresh-container or quota-enabled acceptance. Earlier pre-extraction batches were 4/5, not hidden or counted as passes.
3. [Concurrent batch-count isolation Preview](https://collab-scout-rcdxfs3k4-circuitstudioais-projects.vercel.app): an additional fresh run returned four cited fields in 17.7 seconds, with agent-selected `SPACE → ACCESS → VENUES` and `premises` focus. All three OSM counts timed out within the shared twelve-second fetch budget; research still completed. These are not zero counts.
4. Local browser replay of a recorded real run: verdicts, fields, checklist, matching PDF source links, one-page PDF, notes, stale-input invalidation, no page errors, tested WCAG A/AA axe checks at 1440px and 390px, and no horizontal overflow passed. Replay is presentation verification, not a new live provider run.
5. Blue Bottle saved artifact was derived from the real four-field run recorded **2026-10-23T23:44:17.846Z**. It contains only three highlights, the original count of 4,292 points and citation-bearing sources; the original grid is not reconstructed. Saved recovery remains visibly dated and never counts as fresh acceptance.

Raw runs, screenshots and PDFs are outside Git under `/tmp/sitebrief-feature-*`. Only this compact summary, scripts and the minimal derived fallback are committed.

## Reproduction

```sh
npm test -- --runInBand
npm run lint
npm run build
node scripts/verify-feature-research.mjs https://EXACT_PREVIEW
PLAYWRIGHT_MODULE_PATH=/path/to/playwright-core PDF_LIB_MODULE_PATH=/path/to/pdf-lib node scripts/verify-feature-ui.mjs https://EXACT_PREVIEW /path/to/recorded-run.json
```

`verify-feature-research.mjs` sends custom briefs to avoid canonical saved/cache recovery. The UI script explicitly replays a real recorded result and must not be cited as live research proof. `save-feature-demo.mjs` derives a compact artifact from a verified fresh canonical-equivalent run, retaining original timestamps.

## Resume / merge gates

1. Supply a dedicated Redis REST endpoint/token through private configuration. Configure Preview only; use a separate Preview budget key.
2. Prove real shared counter exhaustion, parallel admission and reset/outage behavior. Do not claim mocked tests prove Redis service execution.
3. Repeat five fresh full-head Preview runs after quota admission is enabled. Audit field relevance and cited pages, not only counts and IDs. Verify the canonical live path, saved path, custom failures and cache gate separately.
4. Resolve the OSM reliability issue or explicitly defer store counts as unavailable with owner agreement. Never fill a count from the ranked Qloo sample or infer unmet demand.
5. After owner-approved merge/configuration, repeat five cold Production runs and verify live quota and verdicts. Saved/cache responses are not fresh passes.

Deferred: retrospective opening scorecard, share-link storage, top-two deep research, accounts/billing and additional sentence filters.
