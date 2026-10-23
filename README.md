# Sitebrief — restaurant expansion, with evidence

**Find where to scout your next restaurant—with an evidence-backed brief.** Site Scout combines Qloo taste/popularity evidence, operator expansion rules, audience signals and cited web research into a scouting decision and a one-page PDF.

Independent restaurant operators, small chains and franchise teams use the same flow. No account or candidate property address is needed. No customer validation is claimed.

- **Verified review demo:** https://collab-scout-r1bgogxxt-circuitstudioais-projects.vercel.app
- **Production:** https://collab-scout.vercel.app — unchanged; the new agent is on PR #6, not production.
- **Source:** https://github.com/circuitstudioai/collab-scout · MIT.
- **MCP endpoint:** `/api/mcp` — stateless Streamable HTTP, tested separately with the official MCP SDK before claiming client compatibility.

## The agent's decision

1. Resolve the intended audience brands, not a long list of same-name outlets.
2. Retrieve Qloo heatmap affinity **and popularity** for the city.
3. Apply the operator radius and existing-outlet distance rule.
4. Rank strong taste points by **local affinity percentile minus popularity percentile**. This is rank contrast, not calibrated probability lift or demand. Zero-popularity points do not become “whitespace”.
5. Read Qloo taste tags, signed demographic affinity and related brands. Compare one actual nearby venue's returned tags.
6. Choose an eligible area to research with Google Search, then return a bounded agent interpretation, trade-offs and a next action. Tool execution appears in the interface as it happens.
7. Download a one-page Expansion Brief PDF or complete scouting notes with sources.

The model chooses eligible area IDs and calls tools over multiple turns. It cannot change the operator's constraints, invent Qloo scores or run arbitrary network requests. All raw score and geographic rules remain deterministic. Removing Qloo removes the actual shortlist and the evidence the agent uses.

## Qloo integration

Server-side `X-Api-Key`, `https://hackathon.api.qloo.com`, GET requests only:

| Request | Decision input |
|---|---|
| `/search`, including `types=urn:entity:brand` when needed | Actual reference IDs; exact brands take priority over outlets |
| `/v2/insights`, `filter.type=urn:heatmap` | Affinity, popularity and affinity rank at real returned map points |
| `/v2/insights`, `filter.type=urn:entity:place` | Deduplicated nearby dining sample, not a competitor census |
| `/v2/insights`, `filter.type=urn:tag` | Returned audience taste connections |
| `/v2/insights`, `filter.type=urn:demographics` | Signed reference age-affinity signals, not local resident percentages |
| `/v2/insights`, `filter.type=urn:entity:brand` | Related brand connections, not confirmed nearby partners |
| `/v2/analysis/compare` | Shared and separate returned reference/venue tags, not proof of unmet demand |

Gemini 2.5 Flash drives the bounded tool loop. A separate Google Search-grounded research tool returns provider-supplied citations, source links and retrieval dates. No source-free fallback is presented as research.

## Try the recording journey

Choose **Try the Toronto playground café**. The scenario is a new café with an indoor playground. Three local café references are selected by Qloo popularity from the returned Toronto café sample, not an exhaustive city leaderboard. Prices, hours and existing outlets remain unspecified. Watch actual tool activity, inspect city-local contrast, read the decision, open a research source and download the PDF.

The canonical example may reuse a real run for 15 minutes on a warm server instance. Reuse shows the original timestamp; it is not simulated live activity. This cache is best-effort, not durable quota protection. Custom runs are not cached by this demo route.

`/compare` preserves live known-address comparison and a clearly labelled fixed sample. The primary route does not default to fabricated evidence.

## MCP / agent access

Configure an MCP-capable client with this verified review server URL (production is not promoted yet):

```json
{"mcpServers":{"sitebrief":{"url":"https://collab-scout-r1bgogxxt-circuitstudioais-projects.vercel.app/api/mcp"}}}
```

Tools: `explore_restaurant_areas`, `compare_restaurant_sites`, `audience_profile`, `research_restaurant_area`, `scout_restaurant_city`.

For a long scout call, allow a 180-second request timeout. The public demo is read-only and concurrency-limited; it is not a production multi-tenant service. `/api/scout` also publishes its input schema and streams tool events through SSE. Existing schemas: `/api/explore/tool`, `/api/sites/tool`, `/api/research`.

## Develop and verify

```sh
npm install
npm run dev
npm test -- --runInBand
npm run lint
npm run build
```

Set server-only `QLOO_API_KEY`, `QLOO_API_URL=https://hackathon.api.qloo.com`, and `GEMINI_API_KEY`. After changing Vercel environment values, redeploy. A local redacted/placeholder environment download does not test a deployed credential.

- Product and method: `docs/RESTAURANT_EXPANSION.md`.
- Recording guide: `docs/restaurant-demo-plan.md`.
- Current hosted evidence: `docs/agent/` and `docs/mcp/`; earlier core-flow evidence: `docs/restaurant-demo/`.
- Optional hosted verification scripts: `verify-scout-agent.mjs` uses Node fetch; `verify-mcp.mjs` requires the official MCP SDK; `verify-agent-ui.mjs` requires playwright-core, axe-core and pdf-lib plus Chromium. They accept module-path environment overrides for an isolated tool installation. See `docs/agent/review.md` for the commands used.
- Legacy collaboration prototype: `docs/LEGACY.md`; it is not the submitted restaurant product.

## Limits

Taste is not foot traffic, rent, property availability, revenue or success. Outlet buffers measure straight-line separation, not cannibalization or legally protected territories. Nearby samples do not establish market saturation or whitespace. Rank contrast is exploratory, and small differences should not determine a lease decision. Research sources can be incomplete or stale. Verify actual properties, permits, access, operating economics and observed conditions in person.
