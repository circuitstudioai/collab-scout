# Location entry

City-first discovery is the primary `/` route. Known-address comparison is available at `/compare`.

1. Choose and confirm a city using its province/state and country.
2. For comparison, search each address or neighbourhood and confirm the intended result. Approximate area centres are not available rental units.
3. Enter known rents and audience references, then compare. Exact brand records resolve before same-name outlets; genuinely ambiguous matches remain explicit.

Changing the city invalidates prior pins/results while preserving rents. Map placement and explicitly validated manual coordinates remain alternatives to lookup. Request failures preserve entered values and expose recovery actions.

`/api/locations` uses Photon/OpenStreetMap with bounded results, timeout and warm-instance caching. Its public demo service has no availability guarantee. No paid geocoder is provisioned here. Attribution remains visible.

Current acceptance is in [quality/comparison](quality/comparison/validation.json). Older screenshots/JSON under `location-ux` retain their original preview and date as historical receipts. Do not treat them as proof of a new release. The browser verifier is `scripts/verify-location-ux.mjs <URL>`; Playwright and axe module-path overrides support an isolated QA installation.
