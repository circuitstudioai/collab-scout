# Sitebrief validation

## Cold-start demo recovery review

PR #7 was merged as `94c130c` on October23. Its three-fix preview receipts remain below. The follow-up cold-start branch adds deterministic ranking-only recovery and an explicitly dated saved canonical demo. Current receipts are in [cold-demo](cold-demo/README.md). The follow-up review preview is https://collab-scout-odq1cmq4f-circuitstudioais-projects.vercel.app. It is a separate unmerged review change; quota remains deferred.

## Merged three-fix validation

The three-fix branch passed **82 tests in14 suites**, lint, production build and diff checks. Current tested preview: https://collab-scout-l6ibhw23i-circuitstudioais-projects.vercel.app. That exact receipt remains a historical preview; PR #7 has since merged.

Fresh Blue Bottle and the owner-specified playground-café agent both completed with structured decision codes and correct actual ranks. The default20th-percentile and median popularity floors were verified. The one-click café test checked actual research citations, a valid one-page PDF, desktop/mobile axe rules, no overflow/page errors and stale-result invalidation when changing the popularity setting. See [quality acceptance](quality/README.md), [live ranking receipt](quality/validation.json) and [UI receipt](quality/ui-validation.json).

Official MCP SDK and13 secondary-comparison checks passed on earlier previews of the same relevant code paths; their receipts preserve those distinct URLs. They are not falsely labelled as new provider calls against the final preview. No quota change is included. No Devpost submission was made.

The initial regression reproduced the agent calling a lower-ranked point highest contrast and asserting a market gap. New contract tests cover a lower-ranked visit choice with its actual rank, strict decision codes, ties and rejection of free-text claims. Popularity tests cover the mandatory floor, missing coverage and outlet exclusions.

## Historical acceptance artifacts

`docs/agent/`, `docs/mcp/`, `docs/location-ux/` and other dated JSON/image artifacts retain their original URLs and timestamps. They document past runs only, not the current review branch. Old internal review notes and obsolete product specs were removed; Git history preserves them.

## Required gates

Run unit/contract tests, lint, build and diff checks. Verify fresh Blue Bottle and the Toronto café flow separately from synthetic/replayed UI checks. Confirm actual rank/tie claims, enforced popularity floor, missing-data behavior, map/card links, source inspection, one-page PDF, desktop/mobile accessibility and stale-result invalidation. Preserve secondary comparison and existing MCP behavior. Report exactly what was tested, not a universal certification.
