# Current feature branch

## Current bounded release — owner approved October 24

See [release readiness](release-readiness.md). Hosted Upstash Redis admission is active: 50 top-level live jobs per UTC day per environment, atomic UTC rollover and fail-closed outages/exhaustion. Per-visitor limits and MCP authentication remain deferred.

Generated local summaries are withheld across fresh research, HTTP/MCP/SSE, canonical cache, dated saved references, UI, PDF and notes. Source links are inspection material, not verified local findings. Qloo ranking, popularity floors, locked visit identity and the City/landlord checklist remain unchanged. The current release gate requires honest source-only output, not three populated fields or geographic acceptance. Broader locality validation belongs in a draft follow-up PR.

The owner authorized this bounded pass, PR10 merge and Production smoke. Preview/Production receipts are recorded separately; a landing smoke is not full research acceptance. Historical receipts below describe their own commits and superseded gates.

# Sitebrief validation

## Same-area research correction

The current correction locks visit selection before research, requires matching point IDs/coordinates in every output and recovery path, removes unsupported obligation statements, and labels unnamed points honestly. Validation and the exact review preview belong in [final-area research](final-area-research.md). No production promotion or merge is included in this correction.

## Historical PR #8 acceptance gap

PR #8 merged as `dedbc52`. Its five fresh runs did contain cited research and rank-one visits, but three did **not** contain research for that final visit. The old gate was insufficient. [Preserved historical receipts](research-recovery/README.md) must not be used as proof of same-area research. The follow-up adds the missing identity gate across server, UI, downloads, cache and saved recovery.

## Historical cold-start review (PR #8, now merged)

PR #7 was merged as `94c130c` on October23. Its three-fix preview receipts remain below. The follow-up cold-start branch adds deterministic ranking-only recovery and an explicitly dated saved canonical demo. Current receipts are in [cold-demo](cold-demo/README.md). The follow-up review preview is https://collab-scout-odq1cmq4f-circuitstudioais-projects.vercel.app. That historical receipt predates the now-active shared Redis admission.

## Merged three-fix validation

The three-fix branch passed **82 tests in14 suites**, lint, production build and diff checks. Current tested preview: https://collab-scout-l6ibhw23i-circuitstudioais-projects.vercel.app. That exact receipt remains a historical preview; PR #7 has since merged.

Fresh Blue Bottle and the owner-specified playground-café agent both completed with structured decision codes and correct actual ranks. The default20th-percentile and median popularity floors were verified. The one-click café test checked actual research citations, a valid one-page PDF, desktop/mobile axe rules, no overflow/page errors and stale-result invalidation when changing the popularity setting. See [quality acceptance](quality/README.md), [live ranking receipt](quality/validation.json) and [UI receipt](quality/ui-validation.json).

Official MCP SDK and13 secondary-comparison checks passed on earlier previews of the same relevant code paths; their receipts preserve those distinct URLs. They are not falsely labelled as new provider calls against the final preview. No quota change is included. No Devpost submission was made.

The initial regression reproduced the agent calling a lower-ranked point highest contrast and asserting a market gap. New contract tests cover a lower-ranked visit choice with its actual rank, strict decision codes, ties and rejection of free-text claims. Popularity tests cover the mandatory floor, missing coverage and outlet exclusions.

## Historical acceptance artifacts

`docs/agent/`, `docs/mcp/`, `docs/location-ux/` and other dated JSON/image artifacts retain their original URLs and timestamps. They document past runs only, not the current review branch. Old internal review notes and obsolete product specs were removed; Git history preserves them.

## Required gates

Run unit/contract tests, lint, build and diff checks. Verify fresh Blue Bottle and the Toronto café flow separately from synthetic/replayed UI checks. Confirm actual rank/tie claims, enforced popularity floor, missing-data behavior, map/card links, source inspection, one-page PDF, desktop/mobile accessibility and stale-result invalidation. Preserve secondary comparison and existing MCP behavior. Report exactly what was tested, not a universal certification.

## 2026-10-24 geographic-scope experiment rejected

Candidate `092c01d` added explicit one-kilometre search hints and venue/address bindings to grounded research and exact-quote extraction. It passed 160 tests, lint/build and exact-head Preview checks, but **failed hosted acceptance**. Five fresh, quota-metered runs on `collab-scout-az7ceq6ea-circuitstudioais-projects.vercel.app` retained 0, 1, 3, 3 and 1 fields: only 2/5 met the mechanical gate. Raw receipts are `/tmp/sitebrief-scoped-research-20261024/`. No cache or saved evidence was counted; no quota counter was reset.

The fourth run still cited Jimmie Simpson Recreation Centre on Queen Street East. The prior official-source audit identifies its address as 870 Queen St E, approximately 3.31 km from the locked point; adding a radius instruction did not prevent the existing geographic failure. Several other fields continued to contain address/route numbers and were correctly rejected by the unchanged numeric guard. One retained field contained multiple sentences despite the one-sentence request. These are defects, not passing content acceptance.

**The candidate was reverted.** The application returns to the prior tested implementation (`247de04`, also present in docs-only `0b0d0ea`); its earlier mechanical 5/5 result is not full geographic acceptance. This experiment establishes that more search/formatter prompt instructions are not sufficient. The next repair needs source-bound location evidence and validation for each new facility/listing, without relying on a shared street label or deleting words to manufacture a local claim. Preserve the two-search/two-formatter/deadline/quota limits. The historical draft restriction was superseded by the bounded release approval above. Do not spend more quota repeating this rejected prompt-only approach.
