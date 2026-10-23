<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Active product and authority

Sitebrief is a restaurant scouting product. Current source of truth: `docs/SITEBRIEF.md`; architecture: `docs/ARCHITECTURE.md`; method: `docs/SCOUT_AGENT.md`; setup: `docs/SETUP.md`; verification: `docs/VALIDATION.md`.

PR #6 and PR #7 are merged. This follow-up also addresses partial cited-research recovery, safe research diagnostics and evidence-based visit order. Cold-start recovery must retain a verified ranked visit when optional research/model output fails, and label saved canonical demo evidence with its original date. Keep the follow-up review PR unmerged. Do not submit to Devpost, change production or provision paid infrastructure in this change.

Quota work is explicitly deferred. Its incomplete checkpoint is on the separate local branch `fix/sitebrief-visitor-quota-20261023`, not this change. Do not add quota gates, provision a store, choose a global allowance or imply per-visitor protection exists in this PR.

## Evidence boundaries

- Qloo host: `https://hackathon.api.qloo.com`, authenticated server-side with `X-Api-Key`. No secrets in source, client bundles, logs or screenshots.
- Scores, operator constraints, popularity floors, rank comparisons and ties are deterministic. The model chooses eligible IDs and reason/check codes; it cannot supply final ranking prose.
- Qloo popularity is engagement/prevalence, not observed visits. Local percentile contrast is not probability lift, demand, revenue or business suitability. Nearby dining is a small ranked sample, not a census or a market-gap measurement.
- No invented entities, properties, prices, operating hours, customer validation or financial projections. The owner-specified demo is a new café with an indoor playground and popular Toronto café references. Leave unspecified operating details unset.
- Research uses provider grounding metadata for source links. Citations are not a guarantee of geography, freshness or correctness. Keep unsupported claims out of the primary decision; retain practical questions as questions.
- Fail visibly when live data/research is unavailable. Never substitute sample evidence for failed live requests. Sample comparison and reused real runs must remain labelled.
- Tests must cover low-ranked agent choices, actual ties, unsupported gap claims, missing popularity, floor enforcement and outlet exclusions. Run focused regressions, then tests/lint/build and hosted acceptance. State exactly what was verified.

## Extensibility

Keep provider retrieval, deterministic selection, structured agent orchestration and presentation separate. Other industries require their own evidence and suitability rules; do not add a generic industry promise without a supported workflow.
