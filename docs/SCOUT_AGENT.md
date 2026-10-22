# Site Scout — evidence, agent tools, and review gates

## Owner-requested changes

The October22 PR review requested a signal that is not just raw affinity, a visible agent loop, MCP access, audience evidence, a one-click example and PDF, clearer buyers, shorter copy, and repository cleanup. PR6 remains unmerged for owner review. Ranking semantics and the demo identity are explicit owner decisions; do not silently imply calibrated lift, a full competitor census, or actual chain outlets.

## Owner-approved city-local ranking

- Preserve Qloo `query.affinity`, `query.popularity` and `query.affinity_rank`.
- Within actual returned points in the operator radius, compute midrank percentiles for affinity and positive popularity. Midranks preserve ties.
- Contrast = affinity percentile minus popularity percentile. It is a difference in local ranks, NOT probability lift or a revenue/demand model.
- Require at least80% positive-popularity coverage for contrast mode. Zero-popularity points do not become opportunity claims.
- The current draft retains the top30% on audience affinity before sorting by contrast and applying geographic separation. This is a conservative product screen, not a validated market threshold. Outlet buffers remain binding. If the screen has no candidates, show that instead of relaxing rules.
- If popularity coverage is insufficient, explicitly fall back to affinity-only ranking.
- Show near-ties within one contrast percentile point. No special downtown exclusion exists.
- Dedupe nearby dining by returned name. Keep that sample as context; do not score scarcity from five results.

## Bounded Gemini loop

`lib/sites/scout-agent.ts` runs multiple Gemini function-calling turns. The model receives tool results before choosing eligible area IDs and producing a final structured interpretation.

1. `explore_areas`: actual Qloo reference resolution, heatmap and nearby dining; deterministic operator constraints and contrast screen.
2. `audience_profile`: Qloo taste tags, signed reference demographic affinities and related brands.
3. `compare_audiences`: Qloo `/v2/analysis/compare` against one actual nearby returned venue. Empty shared tags are not an unmet-need finding.
4. `research_area`: Google Search-grounded restaurant research, including actual map metrics as context. Target concepts are not searched as if they were existing businesses. Broad neighbourhood statistics are not facts about an exact grid point or a private residence.
5. Structured final interpretation: eligible visit-first ID, reason, trade-off, next action. A forged ID is rejected. Final text is interpretation, not a new measured score.

Limits: seven model turns, eight tool calls, per-request timeouts and two active scouting requests per server instance. Errors do not become invented evidence. Final decisions use an eligible-ID schema and bounded validation retries; malformed or overlong output cannot become a cached demo. Narrative validation rejects digit-based statistics outside verified place labels and explicit demographic-fit phrasing. This is a limited plausibility guard, not semantic fact checking; spelled-out quantities and other assertions may remain and require source review. Verified Qloo metrics stay in deterministic panels. Research receives nearby venue addresses, not audience-reference names or a reverse-geocoded private-home address. Menu prices remain unverified; users follow local source links rather than receiving same-name overseas prices. These guards reduce known failure modes; they are not a universal fact-checking guarantee. This is deliberately constrained, not an unconstrained autonomous consultant.

`POST /api/scout` streams actual tool start/completion/unavailable events, exploration, profile, comparison, research and completion. It does not stream hidden reasoning or simulated progress. `GET` publishes the schema.

## One-click example and exports

The owner specified a new café with an indoor playground. The server requests 30 café-tagged Toronto Qloo places, screens for positive popularity, non-closed records within the 10km demo radius, deduplicates names and selects three by returned popularity. These are the top three in that returned sample, not an exhaustive city leaderboard. Exact local place IDs, names and addresses remain visible. Café taste does not prove parental/family demand. Prices, hours and existing outlets remain unspecified. Research must identify space, access and applicable permission checks without claiming an available or suitable property. The warm-instance canonical cache retains a completed real run for15minutes and displays its original time when reused. It is not durable storage or a guarantee against cold starts/quota exhaustion.

A one-page PDF includes the interpretation, ranked areas, operator rule, source links and compact limits. Full notes retain detailed evidence. Browser validation must parse the downloaded PDF and confirm one page.

## MCP

`/api/mcp` implements stateless Streamable HTTP JSON-RPC, protocol2025-06-18, with initialization, initialized notifications, ping, tools/list and tools/call. GET returns405 because the endpoint does not offer an unsolicited SSE stream. Same-origin browser requests only; non-browser MCP clients without Origin can connect. Unknown methods and invalid arguments produce protocol/tool errors.

The public tools are exploration, known-site comparison, audience profile, sourced area research and the full scouting agent. All are read-only; the public demo is concurrency-limited, not a production multi-tenant service. A long full scout call needs a180-second client timeout. Test with the official MCP SDK; do not claim every named chat client has been separately installed/tested.

## Honesty and release gates

No probability or percentile-of-winning claims. No fabricated customer validation, real chain branches, competitor counts, rent, footfall, revenue, protected territories, operating-cost estimates from housing prices, or price/speed comparisons against paid studies without evidence. No public directory listing, outreach, merge, production promotion or Devpost submission is implied by updating PR6 for review.

Legacy collaboration screens are removed; historical API routes return410. The old partnership orchestrator, drafts, brand seed and product-specific tests are removed; shared Qloo utilities remain. The internal planning upload was moved outside the public repository; Git history is not rewritten.
