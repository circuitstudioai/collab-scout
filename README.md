# Sitebrief — restaurant scouting with evidence

Find areas to investigate for your next restaurant. A bounded Gemini tool workflow combines real Qloo evidence, operator rules and cited practical research. The output is a scouting visit plan, not a lease recommendation.

- **Production:** https://collab-scout.vercel.app
- **Release evidence:** [verified versions and review previews](docs/VALIDATION.md).
- **Source:** https://github.com/circuitstudioai/collab-scout · MIT.

## The decision

1. Choose a city, radius and audience references. Exact brands resolve before same-name outlets.
2. Apply optional outlet buffers, a minimum city-local popularity floor and the taste screen.
3. Rank by local affinity percentile minus popularity percentile; preserve actual ties.
4. Let the agent inspect audience tags, signed demographic affinity, related brands and a nearby-venue comparison, then research an eligible point.
5. The agent chooses an eligible ID and check codes. **Code—not model prose—states actual rank and ties.** The server locks the highest-ranked eligible visit before research. Research and the final visit must match by point ID and coordinates; a later model response cannot switch areas.
6. Inspect sources and download a one-page PDF or full notes. Known-address comparison remains available at `/compare` with a clearly labelled fixed sample.

Balanced discovery excludes the lowest20% of measured local popularity; established popularity uses the median. These are disclosed exploratory settings, not observed visitor counts or validated commercial thresholds. Missing popularity coverage produces no shortlist rather than silently waiving the floor. No downtown exclusion or competitor scarcity score is imposed.

## Try the recording journey

Click **Try Blue Bottle in Toronto** for the proposed expansion example. **Or try the playground café** retains the owner’s secondary new-concept scenario. Local café references come from Qloo's returned Toronto café-tagged sample, not an exhaustive city leaderboard or proof of family demand. Prices, hours and existing outlets remain unspecified.

Watch actual tool activity, inspect rank/ties and floor, open a cited source, and download the PDF. Four research fields each show grounded findings or “not found.” An unsupported field does not remove the others. Scout/Maybe cards show priority and reasons; Skip cards explain actual rejected rules. Mapped OSM café/restaurant counts add descriptive context, never an unmet-demand claim. Reused real runs show their original time. On unavailable/incomplete live evidence, the canonical example can show a clearly labelled saved reference run with its original date and only the saved highlights. Custom briefs never receive that saved café. The live demo has a60-second work deadline; Gemini/research cancellation prevents later model stages. A separate shared Upstash Redis budget protects live requests. Until the Free Marketplace store is configured, live requests fail closed; recorded examples must pass the same three-field/two-source quality standard. See [setup](docs/SETUP.md).

## Provider roles

| Request | Evidence |
|---|---|
| Qloo `/search`, optionally brand-only | Verified audience entity IDs |
| `/v2/insights` heatmap | Original affinity, popularity and affinity rank |
| `/v2/insights` places | Deduplicated nearby dining sample |
| `/v2/insights` tags/demographics/brands | Audience taste, signed reference affinities and brand connections |
| `/v2/analysis/compare` | Returned shared/separate reference and venue tags |
| Gemini2.5Flash function calls | Allowed tool selection and structured eligible decision codes |
| Google Search grounding | Source-linked practical research, not Qloo scores |

Qloo host is `https://hackathon.api.qloo.com`, with server-side `X-Api-Key`. No failed live call becomes invented/sample evidence. Removing Qloo removes the actual shortlist evidence.

## MCP

`/api/mcp` exposes five read-only tools over stateless Streamable HTTP: exploration, known-site comparison, audience profile, research and the full scouting agent. Test interoperability with the official MCP SDK; no claim that every branded client was separately installed. Allow a180-second timeout for a complete scout call.

```json
{"mcpServers":{"sitebrief":{"url":"https://collab-scout.vercel.app/api/mcp"}}}
```

**Quota work is deferred.** This review PR does not add per-visitor limits or MCP authentication. Existing concurrency counters are per instance, not a global usage/spending ceiling.

## Development and evidence

```sh
npm ci
npm run dev
npm test -- --runInBand
npm run lint
npm run build
```

Configure server-only `QLOO_API_KEY`, `QLOO_API_URL` and `GEMINI_API_KEY`; redeploy after Vercel changes. See [setup](docs/SETUP.md), [product scope](docs/SITEBRIEF.md), [architecture](docs/ARCHITECTURE.md), [method](docs/SCOUT_AGENT.md), [verification](docs/VALIDATION.md) and [recording guide](docs/restaurant-demo-plan.md).

Current follow-up evidence belongs in `docs/quality/`. Older dated JSON/image artifacts retain their original URLs and do not prove a newer release. Obsolete product/internal notes were removed; Git history retains them.

## Limits

Taste/popularity are not measured footfall, demand, rents, available units, revenue or success. Nearby samples do not establish a market gap. Source citations are not a universal accuracy guarantee. Verify premises, access, permissions and operating economics in person. No customer validation or study-cost savings are claimed.
