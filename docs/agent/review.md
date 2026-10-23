# Owner review update — October 22, 2026

Baseline: `4d95cd4`. These are separate Standards and Spec **self-review** passes, not an independent review. PR6 stays open and unmerged. The exact accepted app is the preview linked from `validation.json` and `ui-validation.json`.

## Standards

- Read installed Next route-handler guidance; server-only Qloo/Gemini access. No key values were printed or added to client source. A scan of 140 candidate repository files found no matches for locally available credential values.
- Input validation and allowed tool stages prevent invented tools, forged area IDs and changed operator constraints. Seven model rounds / eight tool calls bound the agent; malformed final output receives bounded validation retries, never fabricated decisions.
- MCP initializes and calls a real tool with the official SDK. It is stateless Streamable HTTP, read-only, origin-checked for browser callers, and concurrency-limited. No claim of separately testing every branded chat client.
- PDF download is parsed as a real one-page PDF. Desktop/mobile screenshots were visually inspected; tested axe rules, overflow and page-error checks pass. These are scoped checks, not a universal accessibility certification.
- Internal planning upload removed from the current tree after a recoverable copy outside the repository; history is not rewritten. Legacy screens retired and the old partnership orchestrator/drafts/seed/product tests removed (shared Qloo utilities retained). MIT license is detectable.

## Spec

- Owner-approved ranking: within-radius affinity minus popularity percentile contrast. Retain raw popularity, preserve ties, exclude zero-popularity cells from contrast candidates, screen top-30% affinity, keep outlet exclusions binding, and disclose affinity fallback. No claimed probability lift, competitor census or validated opportunity score.
- Actual Gemini turns call Qloo exploration, audience profile, venue comparison and cited web research before a structured final interpretation. Real tool events are streamed. Nearby samples are deduplicated; demographic scores are signed reference affinities, not resident percentages.
- Owner-specified demo: a **new café with an indoor playground**, with three distinct Toronto café references from the returned café-tagged Qloo sample, selected by popularity. Exact place IDs/addresses stay visible. No invented existing outlets, prices or hours.
- Live reference sample: Dineen Coffee Co., FIKA Cafe and Rooster Coffee House. This is not an exhaustive Toronto leaderboard and does not demonstrate demand from families.
- Evidence review caught invalid/overlong decisions, same-name overseas menu prices, private-home context and unsupported demographic matching. The final schema, retries, narrowed research context, nearby venue addresses and narrative checks address those known failure modes. Numerical Qloo evidence remains visible separately; local menu prices are explicitly unverified. The narrative guard is heuristic, not a semantic fact checker; spelled-out quantities and other research assertions can remain. Inspect the linked sources and do not treat industry guidance as an exact legal/property requirement.
- Research cites provider grounding sources. Citation presence is not a universal truth guarantee; source geography, freshness, permissions and property suitability still require verification. The model's interpretation is labelled as interpretation.
- Buyer copy targets restaurant operators, expansion teams and real-estate advisers. No invented customer validation, sales forecasts, study-cost savings or guaranteed completion speed.
- Completed real runs may be reused for fifteen minutes on a warm server, visibly labelled with original time. This is not durable replay storage or quota protection. Incomplete/invalid decisions are not cached as successful demos.

## Verification

- 73 tests / 12 suites; lint and production builds pass.
- `validation.json`: actual complete four-tool agent run, three Qloo-local café references, valid local-contrast candidates, real audience/compare evidence and grounded citations.
- `ui-validation.json`: hosted one-click result, decision/profile/research, one-page PDF, desktop/mobile accessibility, no overflow/page errors and constraint-change invalidation. Any server cache reuse is labelled; no synthetic transport was used for this acceptance.
- `../mcp/validation.json`: official MCP SDK initialization, five tools listed and a live Qloo exploration call with automatic Starbucks brand recognition.
- `../location-ux/validation.json`: secondary comparison evidence, if present; earlier evidence reports retain their original preview URLs and must not be treated as tests of this release.

### Reproducing the hosted checks

The scripts accept the preview URL as their first argument. Optional verification packages can be installed separately from application dependencies:

```sh
npm install --prefix /tmp/sitebrief-verification @modelcontextprotocol/sdk playwright-core axe-core pdf-lib
node scripts/verify-scout-agent.mjs "$PREVIEW_URL"
MCP_SDK_PATH=/tmp/sitebrief-verification/node_modules/@modelcontextprotocol/sdk/dist/esm node scripts/verify-mcp.mjs "$PREVIEW_URL"
PLAYWRIGHT_MODULE_PATH=/tmp/sitebrief-verification/node_modules/playwright-core AXE_SCRIPT_PATH=/tmp/sitebrief-verification/node_modules/axe-core/axe.min.js PDF_LIB_MODULE_PATH=/tmp/sitebrief-verification/node_modules/pdf-lib node scripts/verify-agent-ui.mjs "$PREVIEW_URL"
```

Playwright requires an installed Chromium browser. Without environment overrides the scripts resolve the normal package names. `SCOUT_REPLAY=1` is an explicitly labelled UI-only diagnostic using a previously captured real run, not live acceptance.

## Owner review / remaining actions

Review PR6 and record the café scenario. No merge, production promotion, public MCP-directory listing, outreach or Devpost submission occurred. The one-page PDF is a scouting artifact, not a site study or property recommendation. Devpost login/human verification remains separate.
