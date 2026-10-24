<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Active product and authority

Sitebrief is a restaurant scouting product. Current source of truth: `docs/SITEBRIEF.md`; architecture: `docs/ARCHITECTURE.md`; method: `docs/SCOUT_AGENT.md`; setup: `docs/SETUP.md`; verification: `docs/VALIDATION.md`.

PR #6–#9 are merged. The owner approved implementation on `final-features-push`: structured per-field grounded research, quality-gated cache/recovery, visible agent research priorities, verdict cards, descriptive mapped category counts, real progress, Blue Bottle as the lead example, shared quota and location naming fallback. Keep visit-first identity, deterministic ranks/ties, popularity floor and unsupported-number/gap guarantees. Do not add more sentence-deletion filters. The current structured protocol uses Gemini 2.5 Flash with Google Search; no silent model change.

This feature branch is authorized through reviewable PR and Preview verification, not merge, production changes, submission or paid infrastructure. Explicit later owner instructions supersede this boundary. Quota is in scope: shared Vercel Marketplace Upstash Redis admission must fail closed, including MCP and standalone paid routes. Never fall back to process-local counters. The owner's latest direction supersedes Supabase: use Free only, US East, disable auto-upgrade and eviction, connect Preview/Production server-only Sensitive REST credentials. Keep 50/day per environment. Human Marketplace terms acceptance is currently required; no resource exists. Production storage/env setup is authorized, not Production app deployment/merge/submission. Do not claim quota activation or final live acceptance until hosted checks pass. Missing mapped-store counts may show Unavailable and are optional; never invent zero.

## Evidence boundaries

- Qloo host: `https://hackathon.api.qloo.com`, authenticated server-side with `X-Api-Key`. No secrets in source, client bundles, logs or screenshots.
- Scores, operator constraints, popularity floors, rank comparisons and ties are deterministic. The server locks the highest-ranked eligible visit before research (stable tie selection, ties remain explicit). The model chooses research field priorities, a research focus, comparison target and check codes, not a different visit; it cannot supply final ranking prose.
- Qloo popularity is engagement/prevalence, not observed visits. Local percentile contrast is not probability lift, demand, revenue or business suitability. Nearby dining is a small ranked sample, not a census or a market-gap measurement.
- No invented entities, properties, prices, operating hours, customer validation or financial projections. The lead demo is a proposed Blue Bottle entry into Toronto. The new café with an indoor playground and Toronto café references remains a secondary example. Leave unspecified operating details unset.
- Research uses provider grounding metadata for source links. Citations are not a guarantee of geography, freshness or correctness. Keep unsupported claims out of the primary decision; retain practical questions as questions.
- Fail visibly when live data/research is unavailable. Never substitute sample evidence for failed live requests. Sample comparison and reused real runs must remain labelled.
- Acceptance must require cited research for the final visit ID and coordinates, not any area in a run. UI/PDF/notes/cache/saved recovery use the same check.
- Keep new raw run logs, screenshots and PDFs outside Git; commit only compact acceptance summaries and reproduction scripts. Preserve historical receipts without rewriting Git history.
- Tests must cover attempted low-ranked agent choices, actual ties, unsupported gap claims, missing popularity, floor enforcement and outlet exclusions. Run focused regressions, then tests/lint/build and hosted acceptance. State exactly what was verified.

## Extensibility

Keep provider retrieval, deterministic selection, structured agent orchestration and presentation separate. Other industries require their own evidence and suitability rules; do not add a generic industry promise without a supported workflow.
