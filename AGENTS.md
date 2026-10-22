<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Current authorized product: Sitebrief

Abhi authorized building, publishing and submitting the restaurant-site comparison pivot on 2026-10-21. This supersedes old Collab Scout review-only/no-submission instructions for this task. Preserve existing main until release gates pass. Product source of truth: docs/SITEBRIEF.md. Validation: docs/VALIDATION.md. Submission copy: docs/sitebrief-devpost.md.

No customer validation is claimed. No keys in source or client bundles. Qloo host is https://hackathon.api.qloo.com with X-Api-Key. No invented entities, taste scores, availability, demand or financial projections. Sample mode stays fixed and clearly disclosed; never replace failed live calls with mock evidence. Do not submit until live sponsor integration and published demo acceptance pass. No paid upgrades authorized. Never contact brokers/owners or send outreach.

Current primary product is city-first discovery: / and POST /api/explore, with schema at /api/explore/tool; docs/CITY_DISCOVERY.md defines the new authorized scope. Known-location comparison is secondary at /compare and POST /api/sites. Both POST routes are agent-callable decision tools. Keep score decisions deterministic. Gemini orchestrates the bounded scout loop and the separate sourced restaurant-area research endpoint; deterministic Qloo scores and outlet exclusions remain independent. Current restaurant expansion scope: docs/RESTAURANT_EXPANSION.md. The previous Collab Scout source is recoverable in Git history; its remaining docs are historical rather than current requirements.

## October22 owner review scope

Current release improvements are documented in docs/SCOUT_AGENT.md. Keep PR6 unmerged for owner review. The agent uses Qloo popularity and deterministic local rank contrast; do not call it calibrated probability lift or infer competitor scarcity from a small ranked venue sample. The owner approved city-local taste/popularity rank contrast. The demo is a new café with an indoor playground, using popular Toronto cafés resolved from live Qloo records; no hypothetical existing outlets, prices or hours. Legacy collaboration routes are retired; historical partnership implementation is removed. No merge, production promotion, public directory listing or Devpost submission is authorized merely by the latest request to update and ping PR6.
