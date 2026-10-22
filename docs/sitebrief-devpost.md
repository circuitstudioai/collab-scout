# Sitebrief submission draft

Not submitted. City-discovery redesign is on review PR #6; production promotion and final Devpost human verification/login remain open.

## Tagline
Find where to scout your next restaurant—with taste evidence, expansion rules and sourced trade-offs.

## Inspiration
A restaurant founder may know the city but not which areas to investigate. Asking for a shortlist of addresses puts the discovery work back on the founder. Sitebrief starts with a city and audience assumptions, then helps plan scouting visits.

## What it does
Choose a city, describe the restaurant, and enter brands or places the intended audience might like. Starter chips provide editable examples. Select a radius and explore live Qloo taste-map evidence without needing candidate addresses or rent quotes.

The app highlights up to three separated high-scoring map points, attaches nearby OpenStreetMap place labels and Qloo dining context, and explains each point's relative rank within the returned local evidence. Users can inspect sources, save highlights in the current tab and download scouting notes. Known-address comparison is a secondary workflow with search, optional rents, explicit budget exclusions, ties and missing-data handling.

## October 22 restaurant expansion update

The current scope adds exact brand-first recognition, location suggestions as users type, optional existing-outlet distance buffers, explicit rejected-point evidence and a restaurant-specific web research panel. Independent operators, small chains and franchisees use the same flow. Restaurant format, service period and price position guide the separate research; they do not alter Qloo taste scores. See RESTAURANT_EXPANSION.md.

Gemini 2.5 Flash with Google Search is implemented, including inline grounding citations and source links. Live research passed after the owner updated the Gemini credential and redeployed. Source links and inline citations come from actual Google grounding metadata; tests of fallback rendering alone are not live evidence.

## How we built it
Next.js, React, TypeScript, Zod and Leaflet, with Qloo data and Photon/OpenStreetMap geocoding. Two server-side agent-callable tools publish JSON schemas: city exploration and known-location comparison. Both resolve audience records explicitly, gather real geographic evidence and apply deterministic rules. No language model assigns scores, infers demand or invents locations.

Discovery filters the actual Qloo response to a 5/10/20 km circle around a chosen center and selects spatially separated high-scoring points. It does not calculate neighborhood-wide averages. Nearby names are geocoder labels, not property listings. Failed requests and unavailable context remain visible; the app never replaces failed live requests with sample evidence.

## How Qloo contributes
Qloo resolves selected brands/places, provides the shared geographic taste map and ranks nearby dining samples. Those responses are the discovery evidence. An explicit audience assumption is necessary; the restaurant description labels the search rather than independently changing the scores.

Real Toronto browser testing retrieved 8,363 Qloo points, with 4,292 within 10 km of the selected center, and completed discovery, source inspection and notes export. Counts are specific to that test, not guaranteed coverage.

## What we learned
Geocoding a place, finding a taste signal and proving a restaurant can succeed are different tasks. We keep those distinctions visible. The design now starts with city exploration rather than requiring founders to know the answer before searching.

## Current limits
No customer interviews or purchase-intent validation have been completed. Taste scores do not establish population, unmet demand, foot traffic, sales, profitability or rental availability. Highlights are returned map points with nearby labels, not verified neighborhood recommendations. Photon demo availability is not guaranteed. Saved highlights are tab-local; no account is required.

## Testing instructions
1. Open the review demo and choose Try Toronto, Canada.
2. Keep or edit the coffee-bar brief and audience references.
3. Choose Find areas to scout.
4. If asked, select the intended Qloo audience record, then explore again.
5. Review map highlights and their local rank explanations.
6. Inspect nearby dining and exact data sources.
7. Save an area and download scouting notes.
8. Change the city or radius and confirm old highlights disappear.
9. Use Compare locations for the secondary fixed-sample/custom-address workflow.

## Submission gates

- [x] Real Qloo search, map and nearby dining requests verified
- [x] Public MIT repository and source available
- [x] Local discovery and secondary-comparison browser checks passed
- [x] Exact updated public discovery preview verified: https://collab-scout-3eidzj8w8-circuitstudioais-projects.vercel.app (application commit `770a5d6`)
- [ ] Review complete and release promoted to the stable demo URL
- [ ] Devpost human verification/login completed
- [ ] Submission receipt and public project URL recorded
