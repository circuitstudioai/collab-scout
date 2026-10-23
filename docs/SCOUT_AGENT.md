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

After exploration, server code locks a stable highest-ranked eligible point. Equal scores remain explicit ties, not a unique commercial winner. The research tool schema allows only that ID; execution also routes any model-supplied ID to the locked point. Final `visitFirst` must equal the locked point. The model chooses check codes, never a different visit. The former lower-ranked practical override is removed from the live workflow. `decision.ts` renders actual rank/ties and visit questions without model-written ranking claims.

Malformed decisions receive bounded repair requests without changing evidence. If the model cannot select an eligible point or optional research fails, keep gathered evidence and show a clearly labelled deterministic top-rank fallback. Do not invent an area when the shortlist is empty. Cache only runs with cited research whose target ID and exact coordinates match the final visit-first point. Sources elsewhere in a run do not count. If research fails, explicitly retain ranking-only evidence for that same point. UI, PDF, notes, canonical caching and saved recovery share this identity check.

## Separate research

Google Search grounding supplies source links and citation offsets. Research receives nearby venue names/addresses, not audience-reference names as purported competitors or a reverse-geocoded private-home address. Numeric/claim guards are limited checks, not universal semantic fact validation. Unsupported market-gap wording is rejected even without digits. Numeric quantities written as words and prescriptive regulatory requirements, supervision obligations and conditional licensing assertions are also rejected; permissions remain verification questions. Rejection now removes the whole affected sentence, not the entire report. Only exact provider-grounded retained sentences receive rebuilt citation offsets. Unaligned or ambiguous segments cannot become citations. If no safe cited narrative survives, provider-returned links remain explicitly labelled sources to inspect, not validated findings. Such sources-only runs are not cached as cited successes. Research has at most two attempts within a total forty-second budget. Logs contain generated request IDs, attempt duration, outcome, counts, failed-rule names and numeric provider status, never prompts, response bodies or credentials. Research failures expose safe categories to the tool activity and standalone API. Verify source geography, freshness and applicability; family demand, available premises and permissions remain unanswered unless independently established.

## Outputs and access

Real tool events stream through `/api/scout`. Read-only MCP tools are available at `/api/mcp`. Current MCP access has not gained authentication or per-visitor limits in this PR; quota work was explicitly deferred. A warm-instance real-run cache retains its original timestamp. The canonical playground demo also has a compact saved reference artifact: original date, original point count and only its three highlights, not a stored city heatmap. On live failure/incomplete research or a60-second live-work deadline, the demo may show that explicitly labelled saved run. Custom briefs never use it. Neither mechanism is quota protection.

The PDF is one page; full notes retain longer evidence and sources. Recorded/cached requests and synthetic UI tests must remain distinguishable from fresh provider acceptance.
