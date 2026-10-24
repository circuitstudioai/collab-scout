# Bounded submission release — October 24, 2026

## Owner decision

PM7115 approved a small readiness pass before PR10 merge and Production verification. This supersedes the earlier docs-only freeze. Do not expand into a general geographic engine. A new draft PR will carry source-bound locality, coverage and research-completeness improvements. Do not represent the current release as geographically accepted.

## Shipped contract

- Qloo audience mapping, deterministic ranking/ties, popularity floors, operator constraints and the locked visit point remain unchanged.
- Generated local summaries are withheld as complete fields, not rewritten by deleting inconvenient words. All four fields say local evidence is unavailable. This deliberately reduces research detail.
- HTTPS source links remain inspection material. Source proximity, freshness, commercial availability and suitability are not verified.
- The same release boundary applies to live HTTP/MCP, SSE events/completion, canonical cache, saved examples, legacy client rendering, notes, PDF and tentative verdicts. Historical free-text decisions are regenerated from deterministic ranking; practical-evidence quotes are removed.
- Canonical source-discovery reuse requires two distinct source links for the exact visit point. This is not the old three-field/two-source quality gate. Saved dates and cached/live labels remain intact. Custom failures never receive a canonical saved example.
- Upstash Redis admission is configured: 50 top-level live jobs per UTC day per environment, separate Preview/Production counters, atomic UTC rollover, fail-closed store errors/exhaustion. Not a hard provider billing ceiling. Per-visitor limits and MCP authentication remain deferred.
- The unused Toronto location helper and tests move to the follow-up; official negative locality observations remain historical receipts.

## Acceptance

Regression tests prove saved and fresh summaries were exposed before the fix and withheld afterward. Additional contracts cover source-only reuse, wrong-point rejection, legacy cached decisions, duplicate/unsafe links, provenance, original deterministic constraints, quotas and custom fallback isolation.

Preview and Production receipts will be recorded below after they are actually observed. A five-run source-only gate proves safe output/identity, not complete geographic research. A browser replay of a historical run proves presentation sanitation, not live retrieval. Actual browser requests are reported separately.

### Local acceptance

- 164 tests / 28 suites, lint and optimized Production build passed.
- Three regressions were observed failing before the boundary: historical saved prose, fresh grounded prose and agent-stream prose. All now pass.
- Historical run1 browser replay passed on the optimized local server: four withheld fields, tentative verdicts, source links/checklist, one-page PDF/exact point, notes, desktop/mobile accessibility, no overflow or page errors, stale-input invalidation. This is replay sanitation evidence, not a fresh provider run. Raw receipt: `/tmp/sitebrief-release-ui-local-20261024/summary.json`.
