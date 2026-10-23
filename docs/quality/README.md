# Three-fix acceptance

Scope: deterministic decision facts, city-local popularity floors/ties, and removal of stale product/internal documentation. Quota enforcement is deliberately excluded.

## Regressions and method

- Before the fix, a valid-looking model response could call a lower-ranked point highest contrast and infer a market gap. Contract tests now reject that free-text response. The model chooses only eligible IDs and reason/check enums; server code renders actual shortlist rank and equal scores.
- The live Blue Bottle baseline selected points around the first local popularity percentile. `floor-probe.json` records this and the compared twentieth-percentile/median alternatives. The default excludes the lowest twenty percent; the optional setting requires median-or-above popularity. These are exploratory settings, not footfall measurements or validated success thresholds.
- Exact ties retain joint ranks. The ranking baseline is calculated before exclusions. Missing popularity coverage cannot silently waive the floor. Tests include the lower-ranked selection, ties, missing popularity, floor enforcement and outlet buffers.
- Research guards reject unsupported gap wording and numerical quantities written as digits or words. A hosted output review exposed spelled-out height/area/price claims; regressions cover them. Regulatory prescriptions are rejected, with permissions framed as verification questions. These are bounded guards, not a universal truth validator.

## Evidence

- `validation.json`: fresh live Blue Bottle agent, actual decision/rank agreement, default floor and median floor.
- `cafe-live-run.json`: real owner-specified playground-café run; raw heatmap cells omitted, original cell count retained. This is a validation receipt, not a replay payload.
- `ui-validation.json`, screenshots and `expansion-brief.pdf`: actual one-click café journey, provider-grounded sources, one-page PDF, desktop/mobile axe checks and popularity-change invalidation.
- `mcp/validation.json`: official MCP SDK initialization/list/call acceptance.
- `comparison/validation.json`: secondary Toronto address comparison, exports, invalidation and explicitly labelled synthetic recovery checks. Each receipt retains its exact preview URL; an earlier unchanged comparison route is not described as a fresh run of another deployment.

## Review axes

**Standards — self-review:** provider retrieval, deterministic selection, decision rendering and UI remain separate. Inputs are schema checked. Existing bounded model/tool budgets and server-only credentials remain. Tests, lint, production build, diff checks and Markdown links were checked. No quota route, storage, token or new service is included.

**Owner scope — self-review:** the three requested fixes are implemented; quota work remains on a separate local checkpoint. Primary rank prose no longer comes from the model. Popularity filtering is mandatory and visible. Removed obsolete/internal notes remain recoverable from Git history. PR #6 is correctly recorded as merged.

The follow-up PR is review-only. This work does not merge it, promote production, submit Devpost or claim general factual/accessibility certification. MCP/public provider-cost exposure is unchanged until the separate quota change.
