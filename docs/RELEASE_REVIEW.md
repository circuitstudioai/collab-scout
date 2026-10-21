# Sitebrief release review — 2026-10-21

Baseline: `621c704920bde7c7f5ba1ad1d9fb72f5a90a3ddc` (main). Review command: `git diff 621c704...HEAD`. Reviewed against AGENTS.md, docs/SITEBRIEF.md and the accepted build/publish request. Two separate passes by the same reviewer, not independent reviews.

## Standards

No blocking documented-standard violations found. API credentials remain server-side. Provider errors never become sample evidence. Entity IDs are checked against a fresh server-side search. Form choices are labelled and keyboard-accessible. Map labels use textContent, not interpolated HTML. Legacy Scout edits, storage-error handling and draft-copy fixes from main are retained.

Nonblocking maintainability observation: SiteDesk uses dense JSX and short local names. A future readability-only change can split the form/results into smaller components; it is not required to validate this release.

## Spec

Two functional gaps were found and corrected:

1. Same-name Qloo records stopped the live workflow. The server now returns explicit choices; the user selects a stable ID with type/address/closed status. A forged or stale selection cannot bypass search validation.
2. The API supported two or three locations, but the UI required three. Users can now remove a third location or add one back. Two locations remain the minimum; new rent remains unknown, not inferred.

Live hosted acceptance proves search, one shared geographic heatmap, nearby restaurants, deterministic rent exclusions, missing-evidence behavior and memo export. No LLM, demand/revenue forecasts, listing-availability claims, outreach or accounts were added.

Devpost human verification remains the external submission blocker. A published app is not a submitted entry.

Summary: Standards — 0 blocking findings, 1 nonblocking readability observation. Spec — 2 findings fixed; 0 known open functional blockers, final production verification passed at https://collab-scout.vercel.app.
