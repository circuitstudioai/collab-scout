# Sitebrief

Compare restaurant locations with Qloo taste evidence, rent constraints, and explicit unknowns. Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/). MIT licensed.

**Status:** working prototype with a disclosed sample mode. Live sponsor authentication is currently blocked by HTTP 401 (`API keys mismatch`) on the documented hackathon host. Not submitted. No customer validation claimed.

## Run

```sh
npm ci
npm run dev -- --port 43125
npm test -- --runInBand
npm run lint
npm run build
```

Open the homepage and run the fixed sample. Choose **Use my locations** to edit the brief and request live evidence. Live analysis requires server-side `QLOO_API_KEY` and `QLOO_API_URL=https://hackathon.api.qloo.com` in `.env.local` or hosting environment. Authentication uses `X-Api-Key`. Never place keys in public environment variables or source files.

## How the tool works

1. Resolve 1–3 reference entities by exact name.
2. Retrieve a common city heatmap from Qloo.
3. Match each site to its nearest returned point within 2 km.
4. Retrieve a taste-ranked sample of dining places within 1 km per site.
5. Exclude sites with unknown/over-budget rent from the supported shortlist.
6. Export the comparison with source IDs, trace and next checks.

`POST /api/sites` accepts the schema in `lib/sites/schema.ts`. The endpoint is agent-callable; `GET /api/sites/tool` publishes its function schema. No LLM-generated scores. No fabricated live fallbacks. A Qloo failure is an error, not permission to show sample evidence as live.

Taste affinity is not customer count, foot traffic, spending, unmet demand or predicted revenue. Reference entities are proxies for intended audiences. Available property listings, verified rent, zoning and operating costs require other evidence. Gemini is not invoked by this workflow.

Map tiles are supplied by OpenStreetMap under its attribution and usage requirements. Leaflet code is BSD-2-Clause. The fixed example has illustrative rents and taste signals; its sites are not advertised available properties.

## Scope and evidence

- [Product decision and API assumptions](docs/SITEBRIEF.md)
- [Validation evidence and blockers](docs/VALIDATION.md)
- [Submission copy — not submitted](docs/sitebrief-devpost.md)

This repository retains the preceding Collab Scout code for continuity. Sitebrief owns `/` and `/api/sites`; legacy source and docs are historical, not current product claims. The pivot is isolated on `feature/restaurant-site-comparison`; existing main/production is preserved until the pivot passes its release gates.
