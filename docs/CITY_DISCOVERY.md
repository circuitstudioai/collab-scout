# Sitebrief Field Atlas — city-first discovery

## Authorized goal

On October 21 Abhi confirmed that city exploration should be primary, with a distinctive map-led experience. The earlier compare-first design forced a founder to supply the locations they wanted the app to help discover. Keep known-location comparison secondary. This update stays in PR #6; no production promotion or submission is included in this review step.

## Primary journey

1. Choose a city by lookup or use the explicit Toronto starter.
2. Describe the restaurant. A starting-point chip sets both the description and an editable audience reference.
3. Provide 1–3 brands/places the intended audience might like. These are user assumptions, not validated local demand. The description labels the search; it is not independently scored.
4. Choose 5, 10 or 20 km from the selected center.
5. Find areas to scout. Resolve ambiguous Qloo records explicitly before continuing.
6. Review the map, named nearby places, local taste rankings and nearby dining evidence.
7. Save highlights in the current tab and download scouting notes before leaving.

No candidate properties, rent quotes or manual pins are required for discovery. `/compare` retains the original two-/three-address comparison, searchable entry, rent checks, fixed sample and exports. A primary-nav link makes that a deliberate secondary path.

## Evidence and selection

`POST /api/explore` is a read-only agent-callable tool. `GET /api/explore/tool` publishes its JSON input schema and disambiguation protocol.

- Resolve the selected audience records with the shared Qloo reader; never pick an ambiguous record silently.
- Request a shared Qloo heatmap for the selected city and audience references, including the restaurant-tag signal.
- Retain only actual returned points within the chosen radius. This is a circle around a selected center, not a verified municipal boundary.
- Deduplicate coordinates, sort by original affinity with deterministic coordinate tie-breaking, and select up to three high-scoring points separated by at least 1 km for a 5 km radius or 2 km for larger radii.
- Each highlight represents a returned point. It is not a neighborhood-average score, exhaustive best-neighborhood search or viable property recommendation. Tied maps explicitly say there is no score-based winner.
- Local relative rank counts all retained points with affinity at least as high as a highlight; the displayed top band is the ceiling of that fraction times 100. Exact lower-scoring point counts and raw affinity remain inspectable. A top band is not a probability of business success.
- Reverse-geocode within 300 m using Photon/OSM, and label the highlight **Near** the returned local area/place. Locality labels may identify landmarks or developments rather than official neighborhoods. If no nearby label is available, use Area A/B/C with exact coordinates and mark the name unavailable.
- Retrieve a ranked sample of up to five nearby dining places within 1 km. Partial failures remain visible. This is not a competitor census.
- Display up to 4,000 evenly sampled dots; all retained points participate in selection/ranking.
- No sample evidence replaces a failed live exploration. Empty coverage returns an actionable error. No invented labels, scores, rental availability, foot traffic or financial projections.

See [Qloo heatmap guide](https://github.com/qloo/docs-public/blob/main/reference/heatmaps-use-case.md) and [Photon API](https://github.com/komoot/photon/blob/master/docs/api-v1.md). Photon demo usage remains modest and cached, with no availability guarantee. Reverse labels use a bounded hourly cache and a six-second timeout. A larger rollout needs a provisioned geocoder.

## Interaction and visual direction

The Field Atlas uses an editorial serif headline, forest/cream surfaces, citron action controls and terracotta map markers. The brief sits beside a large map rather than above a long coordinate form. City selection changes the headline and view. Result cards select map areas; map markers select cards. Radius/city/audience changes clear old results and saved selections. The map and cards are both usable without relying on drag gestures. Loading is tied to a real request, not invented progress percentages. Reduced-motion preferences are respected.

Audience assumptions, map-point method, local ranking denominator, missing-data states and diligence checks remain visible. The interface does not claim novel category invention, validation with customers or guaranteed competitive advantage.

## Verification

Hosted acceptance passed on [this exact preview](https://collab-scout-3eidzj8w8-circuitstudioais-projects.vercel.app) at application commit `770a5d6`. Discovery passed 10 browser checks, including pointer and keyboard marker selection; secondary comparison passed all 13 checks. The separately recorded San Francisco API check used the preceding discovery deployment with the same backend.

- 64/64 tests, lint and production build passed.
- Seven discovery regression cases cover no-site spatial selection, radius filtering, coordinate deduplication, ties, schema bounds, ambiguous audience records, honest missing coverage and partial labeling/dining failures.
- Real Toronto discovery: 8,363 returned Qloo cells, 4,292 within 10 km; three separated highlights; five nearby dining results per highlight. Provider place labels vary over time. No artificial fixtures were used for the successful API flow.
- Browser verifier: `scripts/verify-discovery-ux.mjs <base URL>`. Real exploration, explicit disambiguation, saved-area export, linked card/map selection, city/radius invalidation and synthetic empty-coverage recovery passed.
- Zero axe WCAG A/AA violations in tested initial, result and 390px mobile states; no horizontal overflow or page errors. Screenshots/report: [discovery-ux](discovery-ux/).
- The existing 13-check Toronto address-entry journey also passed at `/compare`, with real Qloo and geocoding requests and explicitly labelled synthetic recovery cases.

Scope remains review-only publication on the current PR. The existing public production app is unchanged. Devpost human verification/login and final submission remain separate.
