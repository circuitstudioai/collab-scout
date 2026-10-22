# Restaurant expansion — demo release

## Authorized direction

On October 22, Abhi chose restaurant scouting with room to expand later and requested a working app for recording a demo. Independent operators, small chains and franchise operators share the same restaurant journey. This is not a general-business suitability engine or a franchise-management platform. No customer validation is claimed.

## One complete journey

1. Search and select a city. The explicit Toronto starter is also available.
2. Describe the restaurant and optionally name the brand. Choose format, price position and service period.
3. Enter audience references. Exact Qloo brand records take priority over identically named outlets. If the general search contains only several same-name outlets, a scoped brand search checks for the exact brand. No model invents entity IDs. Selected IDs are revalidated; genuine ambiguity remains explicit with three compact choices or a more specific input. Choosing continues the request.
4. Optionally search up to five existing outlet addresses and set a minimum straight-line distance.
5. Explore actual Qloo map points within the city-centered radius. Exclude points inside the operator's outlet buffers before selecting up to three spatially separated highlights. Keep the original taste scores and denominator; expose excluded-point examples and the total excluded count. If none remain eligible, show an empty shortlist without relaxing the rule.
6. Select an area and request local web research. Gemini 2.5 Flash uses Google Search; source links come only from grounding metadata. Restaurant details guide research, not Qloo affinity. No-source output fails rather than becoming apparent evidence. Research is separate from the live Qloo request and cannot change its ranking.
7. Save areas and download scouting notes including inputs, constraints, exclusions, Qloo trace and completed research/source links for the exported areas.

## Research boundaries

- Gemini interprets sourced context; the operator makes the decision.
- Grounding citations link source-supported text. The app also shows source links, retrieval time, search queries and Google's returned search suggestions in an isolated, script-disabled frame.
- Prompt instructions require missing data and interpretation to be explicit. A citation does not establish completeness or guarantee accuracy.
- No invented rents, availability, footfall, revenue, customer overlap or success probabilities.
- Minimum outlet distance is an operator rule, not a cannibalization forecast, drive-time analysis or verified protected territory.
- Existing-outlet locations are operator inputs, not independently verified branch records.
- No outreach, accounts, payments, customer activation or submission is part of this demo implementation.

## Extensibility

Restaurant-specific inputs remain in the brief schema; geographic selection, provider access and research are separate modules. Another industry would need its own suitability rules, data and acceptance checks. Do not add an unsupported generic industry dropdown.

## Live blocker at implementation

The saved Vercel Gemini credential returned HTTP 400 API_KEY_INVALID on October 22. Qloo search works, including exact brand recognition for Starbucks and Blue Bottle Coffee. Research must remain marked unavailable until the credential is replaced and a real grounded research request passes. Never describe synthetic browser research checks as live verification.

## Hosted core acceptance — October 22

App implementation `d596de2` is hosted at https://collab-scout-b3hwva7ry-circuitstudioais-projects.vercel.app . The restaurant scenario passed nine checks, including one explicitly synthetic inline-citation rendering check. Real Toronto Qloo discovery returned 4,292 local points; the illustrative operator outlet rule excluded 597 and selected eligible alternatives. All-excluded live requests remained empty. The separate address-comparison journey passed 13 checks on the same deployment. Tested desktop/mobile axe violations and page errors: zero.

70 unit/contract tests, lint, types and production builds pass. Research is still blocked: the live hosted request returns503 with no invented report. The complete sourced-research recording remains unverified. Evidence: restaurant-demo/validation.json, location-ux/validation.json and screenshots. Recording plan: restaurant-demo-plan.md.
