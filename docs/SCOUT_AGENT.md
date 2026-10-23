# Site Scout method and agent contract

## Local ranking

- Retain Qloo affinity, popularity and affinity_rank.
- Filter to the operator radius; compute affinity and positive-popularity midrank percentiles from the returned local evidence. Preserve ties.
- Require at least80% positive-popularity coverage. If coverage is insufficient, return no shortlist rather than silently waiving the popularity floor.
- Enforce existing-outlet distance buffers.
- Balanced discovery requires at least the local20th popularity percentile; established popularity requires the median. These are disclosed exploratory product settings, not validated commercial thresholds or visitor counts.
- Retain top30% audience affinity, order by affinity percentile minus popularity percentile, and select up to three separated points. Percentile baselines are calculated before exclusions, not recomputed after filtering.
- Show actual shortlist ranks and equal scores. A deterministic secondary sort makes ordering stable, not a unique commercial winner.

The live Blue Bottle regression had leading points near the local first popularity percentile. A20th-percentile floor removed that tail; a median floor was also compared. Raw probe summaries and the exact fixtures accompany the current validation. No result is forced outside downtown.

## Bounded tool workflow

Gemini receives real Qloo tool results before selecting eligible IDs. Allowed stages are exploration, audience profile, nearby-venue comparison and source-grounded research. There are at most seven model rounds and eight tool calls.

The final model response contains only `visitFirst`, `reasonCode` and `checkFocus`, with strict enums and an eligible-ID schema. `decision.ts` renders the actual rank/ties and practical visit questions. It never accepts model-written ranking prose. A lower-ranked choice remains possible, but is explicitly shown with its real rank. Free-text market-gap assertions cannot enter this decision channel.

Malformed decisions receive bounded repair requests without changing evidence. If no valid decision is produced, keep the returned map and show an incomplete-decision state. Cache only completed real runs.

## Separate research

Google Search grounding supplies source links and citation offsets. Research receives nearby venue names/addresses, not audience-reference names as purported competitors or a reverse-geocoded private-home address. Numeric/claim guards are limited checks, not universal semantic fact validation. Unsupported market-gap wording is rejected even without digits. Numeric quantities written as words and prescriptive regulatory requirements are also rejected; permissions remain verification questions. Verify source geography, freshness and applicability; family demand, available premises and permissions remain unanswered unless independently established.

## Outputs and access

Real tool events stream through `/api/scout`. Read-only MCP tools are available at `/api/mcp`. Current MCP access has not gained authentication or per-visitor limits in this PR; quota work was explicitly deferred. A warm-instance real-run cache retains its original timestamp and does not provide durable replay or quota protection.

The PDF is one page; full notes retain longer evidence and sources. Recorded/cached requests and synthetic UI tests must remain distinguishable from fresh provider acceptance.
