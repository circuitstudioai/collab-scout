# Sitebrief — submission draft (NOT SUBMITTED)

## Tagline
Compare restaurant sites using taste evidence, rent constraints, and clear next checks.

## Inspiration
Choosing a restaurant location combines a cultural question—does this concept fit the area?—with practical questions about rent and operations. A generic language model can describe neighborhoods convincingly without establishing any evidence. Sitebrief keeps those questions separate.

## What it does
A restaurant founder or commercial realtor enters two or three candidate locations, an intended concept, audience-reference brands or places, and a rent ceiling. The tool resolves the references with Qloo, requests one shared geographic taste heatmap, and attaches the nearest supported evidence to each site. It adds taste-ranked nearby dining context, applies the rent constraint and exports a comparison memo. Unknown rent, unsupported coordinates, ties and partial data failures are visible.

## How we built it
Next.js, React, TypeScript, Zod, Leaflet and OpenStreetMap. A server-side agent-callable tool orchestrates documented Qloo GET requests on the hackathon API. Deterministic logic handles constraints and scoring; no language model invents business facts, probabilities or sources. The evidence trace includes the calls and resolved entity IDs. The sample mode is explicitly illustrative and never silently replaces failed live calls.

## What makes it Qloo-powered
The intended live comparison uses Qloo's cross-domain taste signals and geographic affinity—not a language model's guesses about neighborhood culture. Removing Qloo removes the taste evidence and therefore the supported comparison. Live authentication must pass before this paragraph can be represented as a demonstrated capability.

## Challenges and lessons
Taste affinity is not demand, and a few returned venues do not prove an underserved market. We use a shared heatmap basis, a 2 km evidence-distance cutoff, explicit rent checks and an independent-diligence checklist. Reference brands remain audience proxies, not proof of customer interest.

## Validation and limitations
No customer interviews completed. No claim of market validation, predicted restaurant success, verified leases, complete competition inventory, or revenue estimation. As of October 21, live authentication is blocked by HTTP 401 on the exact hackathon host; the configured key does not establish successful integration. Do not submit this draft until the live workflow passes.

## Testing instructions
Open the hosted demo. Run the illustrative example. The highest sample taste signal is over budget and must not lead the shortlist. Inspect all three sites on the map, expand the evidence trail and download the memo. Then switch to live inputs and complete a real Qloo run after credentials are fixed. Confirm no synthetic evidence appears if any live call fails.

## Submission gates
- [ ] Live Qloo search, common heatmap and site-context responses verified
- [ ] Public hosted demo verified without login
- [ ] Public repository, current source and visible MIT license
- [ ] Screenshots correspond to tested release
- [ ] Devpost verification/login completed
- [ ] Submission receipt and public project URL recorded
