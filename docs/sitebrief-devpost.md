# Sitebrief submission draft

Not submitted. City-discovery redesign is on review PR #6; production promotion and final Devpost human verification/login remain open.

## Tagline
Find where to scout your next restaurant—with taste evidence, expansion rules and sourced trade-offs.

## Inspiration
A restaurant founder may know the city but not which areas to investigate. Asking for a shortlist of addresses puts the discovery work back on the founder. Sitebrief starts with a city and audience assumptions, then helps plan scouting visits.

## What it does
Choose a city and intended audience references, then build a scouting brief. The owner-specified one-click scenario is a new café with an indoor playground in Toronto. The server finds three distinct local café references by Qloo popularity from a returned café-tagged sample; exact names and addresses stay visible. No prices, hours or existing outlets are assumed.

A bounded Gemini function-calling loop gathers real Qloo heatmap evidence, reads audience tags and signed demographics, compares a returned nearby venue, and researches an eligible area with Google Search grounding. The interface streams actual tool activity, displays source-linked trade-offs and exports a one-page PDF. Known-address comparison remains a secondary workflow.

## How we built it
Next.js, React, TypeScript, Zod, Leaflet and Photon/OpenStreetMap. Server-only Qloo and Gemini credentials. `/api/scout` streams the bounded four-tool workflow; `/api/mcp` exposes five read-only tools over Streamable HTTP. The model chooses eligible area IDs and interpretation, not numerical scores or relaxed operator rules. Exact endpoints, limits and reproducible evidence are documented in README and SCOUT_AGENT.md.

## How Qloo contributes
Qloo resolves entities and supplies heatmap affinity/popularity, nearby dining, taste tags, signed reference demographic affinities, related brands and audience comparison. Ranking uses local affinity-minus-popularity percentile contrast among positive-popularity points with top-30% audience affinity. It is not probability lift, customer demand or a competitor scarcity estimate. Insufficient popularity coverage is explicitly an affinity-only fallback. Existing-outlet buffers remain binding when supplied.

The playground concept guides sourced practical research; café taste proxies do not establish family demand or property suitability. The agent combines these distinct evidence types without claiming an available lease or permit approval.

## What we learned
Geocoding a place, finding a taste signal and proving a restaurant can succeed are different tasks. We keep those distinctions visible. The design now starts with city exploration rather than requiring founders to know the answer before searching.

## Current limits
No customer interviews or purchase-intent validation have been completed. Taste scores do not establish population, unmet demand, foot traffic, sales, profitability or rental availability. Highlights are returned map points with nearby labels, not verified neighborhood recommendations. Photon demo availability is not guaranteed. Saved highlights are tab-local; no account is required.

## Testing instructions
1. Open the exact reviewed preview linked from README.
2. Click **Try the Toronto playground café** for the owner-specified playground café scenario.
3. Watch real evidence tool activity; cached runs show their original time.
4. Inspect the three local café references, local-rank contrast, audience profile and cited practical trade-offs.
5. Download the one-page expansion brief. Full scouting notes preserve the longer research and trace.
6. For an AI client, connect to the preview's `/api/mcp` endpoint using Streamable HTTP; see README. Official SDK transport testing is documented, not a claim of separately testing every named chat client.

Not submitted. No receipt, customer validation, study-cost saving or deadline-performance guarantee is claimed. PR6 remains open; production is unchanged.
