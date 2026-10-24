# Sitebrief method and agent contract

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

Malformed decisions receive bounded repair requests without changing evidence. If the model cannot select an eligible point or optional research fails, keep gathered evidence and show a clearly labelled deterministic top-rank fallback. Do not invent an area when the shortlist is empty. Cache only source-discovery runs with two distinct inspection links whose target ID and exact coordinates match the final visit-first point. This is not cited-local-finding acceptance. Sources elsewhere in a run do not count. If research fails, explicitly retain ranking-only evidence for that same point. UI, PDF, notes, canonical caching and saved recovery share this identity check.

## Separate research

Google Search grounding supplies source links and exact support spans. `structured-research.ts` reads four fixed sections (space/listing signals, access/transit, nearby venues, local activity anchors). The model is asked for factual, locally anchored evidence or “not found” in each field. Each entire field is checked against provider grounding and the existing number/gap/obligation boundaries; an invalid field becomes “not found” without sentence deletion. Citation-marker/markdown normalization does not change the underlying factual text. Street aliases such as St W / Street West normalize consistently. Source grounding is evidence provenance, not proof of freshness or geographic correctness; inspect every cited page. The prompt excludes distant facilities, broad demographic claims and residential listings. The actual grid point remains locked.

The agent chooses research field priorities and focus in the research tool call; the activity log records those choices. Search chooses queries and follow-ups. If raw Search fields are incomplete, a separate schema-constrained Gemini call may choose concise verbatim excerpts from exact provider-grounded snippets. The server accepts only substring matches and copies source references from the actual snippet; it never trusts a model-written URL. One bounded retrieval retry can retain prior valid fields and fill missing ones. Recovery now requests only missing fields once cited-source diversity is sufficient, retains the first validated finding/source identity, and evaluates merged retry evidence before starting another formatter call. A single-source report still requests fresh evidence and may replace a field to gain a distinct source; it cannot qualify merely by retaining four fields from one URL. Retry correction text does not echo rejected numeric claims. There are at most two Search calls and two extraction calls within the same deadline, without a model switch. The budget remains forty seconds. The internal three-field/two-source gate describes retrieval mechanics only. The public release projection withholds all generated local summaries until proximity validation exists. Current source-discovery caching and saved fallback require two distinct source links and the visit ID/coordinate check, without claiming three verified local fields. Historical one-sentence reports cannot qualify. Custom briefs never receive a different saved scenario. A fixed City/landlord checklist asks about permitted use, licensing, supervision, layout/access and exits; the model does not supply legal conclusions.

## Outputs and access

Real tool events stream through `/api/scout`. Read-only MCP tools are available at `/api/mcp`. MCP discovery is unmetered; paid tool calls share the same atomic Redis daily budget as HTTP live analyses. This is a global demo allowance, not authenticated per-person tracking. A warm-instance real-run cache retains its original timestamp. Canonical demos may use only a source-discovery-qualified, matching compact saved reference artifact: original date, original point count and only its three highlights, not a stored city heatmap. On live failure/incomplete research or a60-second live-work deadline, the demo may show that explicitly labelled saved run. Custom briefs never use it. Cache and saved recovery avoid new provider work; Redis admission independently enforces the live budget.

The PDF is one page; full notes retain longer evidence and sources. Recorded/cached requests and synthetic UI tests must remain distinguishable from fresh provider acceptance.
