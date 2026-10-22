# Current primary flow: city discovery

Abhi approved city-first exploration on October 21. [CITY_DISCOVERY.md](CITY_DISCOVERY.md) is the source of truth for the primary flow. The comparison requirements below now apply to the secondary `/compare` experience.

# Sitebrief — locked hackathon scope

Decision: Abhi authorized a pivot from Collab Scout on 2026-10-21, including building, publishing, and submitting the working entry. Prior review-only and no-submission instructions are superseded for this work. Collab Scout remains recoverable on main and its existing branches until the new version is ready.

## Audience and decision

Restaurant founders and commercial realtors comparing two or three candidate sites for one restaurant concept. Decide which site deserves investigation first, not whether a restaurant will succeed. No customer interviews or purchase-intent validation have been completed. No claims of validated customer demand.

## Functional scope

- One locality, 1–3 explicitly named audience-reference entities, a monthly rent ceiling, 2–3 candidate coordinates and optional monthly rents.
- GET `/search` on `https://hackathon.api.qloo.com`, header `X-Api-Key`. Accept a unique exact-name match or request explicit selection using type, address, closed status and stable entity ID. Revalidate selected IDs against a fresh search; never choose the first ambiguous match.
- GET `/v2/insights` with `filter.type=urn:heatmap`, `filter.location.query`, `signal.interests.entities` and restaurant tag signal. One common response provides the comparison basis.
- For each site, match the nearest returned heatmap point within 2 km. No interpolation. Compare raw affinity only within that response. No score exists if evidence is absent or too distant.
- GET `/v2/insights` with `filter.type=urn:entity:place`, `filter.location=POINT(longitude latitude)`, 1,000 m radius, restaurant tag filter and reference signals. This is a ranked context sample, not a competitor census. Partial failures stay visible.
- Deterministic decision step filters out over-budget and unknown-rent sites, ranks supported remaining sites by the common heatmap affinity, and returns an explicit tie when appropriate.
- Interactive map shows candidate sites and returned taste points. In custom mode users can explicitly place a selected site on the map or enter coordinates directly. Sample mode is fixed and disclosed. No automatic sample fallback after a live failure.
- Export a plain-text decision memo with inputs, source entity IDs, trace, constraints, method and diligence checklist.
- No accounts, database, broker contact, outreach, lease signing, payments or paid hosting upgrades.

The `POST /api/sites` workflow is an agent-callable decision tool: resolve references → gather geographic evidence → gather site context → apply constraints → return a supported shortlist or a request for better inputs. It does not use an LLM for scoring or invent sources. The concept text describes the brief; the supplied reference entities define the taste signal. Gemini is not required or invoked by Sitebrief.

## Independent facts required

Population, foot traffic, rent verification, zoning, lease availability, permissions, customer spending, sales, build-out costs and profitability are not inferred from taste affinity. Candidate sites are user-supplied coordinates, not automatically sourced available properties. Rents use one user-consistent currency; no conversion.

## Differentiation and competition

Historical GeoTaste (2025 grand prize) and public Tasteplot (2026) overlap geographic business intelligence/site selection. Do not claim novel category invention. Proposed distinction: fixed-candidate restaurant-site comparison with explicit budget exclusions, shared evidence basis, missing-data behavior, and an exportable decision memo. Competitive differentiation remains a hypothesis, not demonstrated superiority.

## Acceptance and current blockers

- 53 tests, lint and production build pass. Three new regression tests cover ambiguity choices, explicit selection, and stale/forged IDs.
- Public preview live browser acceptance passed with 1,553 real Qloo map cells, eight nearby restaurants per site, five successful source steps and a downloadable live memo.
- Desktop and 390px mobile checks passed, with zero axe WCAG A/AA violations in the tested selection/results states and no page errors.
- The earlier 401 reports are historical. Current authentication works against the hackathon host with the server-side encrypted credential.
- Devpost still requires human verification. No submission receipt exists. Never describe a published MVP as a submitted entry.
- Full release evidence: VALIDATION.md and live-browser-validation.json.

## Source references

- https://qloo.devpost.com/rules
- https://github.com/qloo/docs-public/blob/main/reference/heatmaps-use-case.md
- https://github.com/qloo/docs-public/blob/main/reference/parameters.md
- https://devpost.com/software/geotaste-your-agentic-qloo-taste-business-consultant
- https://github.com/maloyan/tasteplot

Official deadline: October 30, 2026 at 11:45 pm Eastern. Four equally weighted criteria: technological implementation, design, potential impact, quality of idea. Required: working Qloo-integrated application, public source and open-source license, published demo, text description. No video required. Keep the demo available through judging, ending November 16, 2026.
