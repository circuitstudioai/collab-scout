# Current restaurant expansion release

The October 22 restaurant expansion scope is defined in [RESTAURANT_EXPANSION.md](docs/RESTAURANT_EXPANSION.md). It supersedes conflicting historical descriptions below, including no-Gemini and mandatory manual entity-selection statements. The primary discovery and secondary address-comparison journeys remain supported.

# Sitebrief

Explore city taste patterns and find areas worth scouting for a restaurant. Candidate-address comparison is available as a secondary workflow. Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/). MIT licensed.

**Review branch:** city-first Field Atlas in [PR #6](https://github.com/circuitstudioai/collab-scout/pull/6). No customer validation claimed. Production is unchanged until review. The entry is not submitted.

City discovery needs a city, a 5/10/20 km radius and explicit audience references; no candidate addresses or rents. It selects separated high-scoring actual Qloo map points and adds nearby-place labels and dining context. Map points are scouting starting points, not predicted demand or available properties.

## Run

```sh
npm ci
npm run dev -- --port 43125
npm test -- --runInBand
npm run lint
npm run build
```

Open the homepage for city discovery. Use **Compare locations** to reach the fixed sample and custom-address comparison at `/compare`. Live analysis requires server-side `QLOO_API_KEY` and `QLOO_API_URL=https://hackathon.api.qloo.com` in `.env.local` or hosting environment. Authentication uses `X-Api-Key`. Never place keys in public environment variables or source files.

## Known-address comparison tool

1. Resolve 1–3 reference names. If multiple records match, let the user choose a specific record by type and address.
2. Retrieve a common city heatmap from Qloo.
3. Match each site to its nearest returned point within 2 km.
4. Retrieve a taste-ranked sample of dining places within 1 km per site.
5. Exclude sites with unknown/over-budget rent from the supported shortlist.
6. Export the comparison with source IDs, trace and next checks.

`POST /api/sites` accepts the schema in `lib/sites/schema.ts`. The endpoint is agent-callable; `GET /api/sites/tool` publishes its function schema. If a name needs a choice, HTTP 409 returns `referenceChoice`. Retry with `referenceSelections: [{ query, id }]` after the user chooses. IDs are validated against a fresh Qloo search. No LLM-generated scores. No fabricated live fallbacks. A Qloo failure is an error, not permission to show sample evidence as live.

Taste affinity is not customer count, foot traffic, spending, unmet demand or predicted revenue. Reference entities are proxies for intended audiences. Available property listings, verified rent, zoning and operating costs require other evidence. Gemini is not invoked by this workflow.

Map tiles are supplied by OpenStreetMap under its attribution and usage requirements. Leaflet code is BSD-2-Clause. The fixed example has illustrative rents and taste signals; its sites are not advertised available properties.

## City discovery tool

`POST /api/explore` accepts the schema in `lib/sites/explore.ts`; `/api/explore/tool` publishes the agent tool definition. The response contains actual city-local cells, up to three separated highlights, source trace and partial-data flags. HTTP 409 requires explicit audience-record selection. Read [the city-first scope and method](docs/CITY_DISCOVERY.md).

## Scope and evidence

- [Product decision and API assumptions](docs/SITEBRIEF.md)
- [Validation evidence and blockers](docs/VALIDATION.md)
- [Submission copy — not submitted](docs/sitebrief-devpost.md)

This repository retains the preceding Collab Scout code for continuity. Sitebrief owns `/`, `/api/explore`, `/compare` and `/api/sites`; legacy Collab Scout source and docs are historical, not current product claims. The Sitebrief release replaces the homepage after the live release gates pass. Legacy Collab Scout routes and fixes are retained.
