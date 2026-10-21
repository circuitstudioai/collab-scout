# City and location entry UX

## Problem reproduced

Baseline main `ffbe420`: typing Toronto changed the comparison's city text but retained New York pins. The location-name fields were labels, not searches. Users had to know coordinates or navigate the map themselves.

- `app/SiteDesk.tsx:47`: “Use my locations” retained the sample's New York locations/rents. New custom comparisons now start with two unplaced locations and unknown rents.
- `app/SiteDesk.tsx:49`: city input changed a string only. City lookup now identifies the correct city with province/state and country, then moves map focus.
- `app/SiteDesk.tsx:51`: “Site name” looked like a place-entry field but changed only a label. Location lookup is now separate from the editable label and fills coordinates after explicit result selection.
- `app/SiteDesk.tsx:51`: latitude/longitude dominated entry. Manual coordinates are now optional expanded details, with explicit validation and confirmation.
- Map-only interaction lacked a clear first action for a different city. Users can now complete the Toronto flow without clicking the map.

## Updated workflow

1. Choose **Start my comparison**.
2. Enter a city, choose **Find location** (or press Enter), then select the intended result.
3. Search an address, intersection or neighborhood for each location. Choose a result to fill its position and label.
4. Enter rents if known, the budget, restaurant idea and audience references.
5. Compare. If Qloo returns ambiguous audience records, choose the intended record and retry.

Changing the city invalidates previous pins and results, while preserving rent values and labels. Users must locate each site again. Neighborhood matches explicitly identify approximate area centers. No address lookup claims a rental is available. Map placement and keyboard-accessible manual coordinates remain alternatives. Empty manual fields cannot silently become zero coordinates.

## Design and copy

Retains the editorial green/cream visual design. Numbered sections separate city, locations and restaurant details. A desktop map follows the form while scrolling. Buttons describe the action. Each search has labelled controls, province/country results, loading/empty/error states and explicit selection. Short plain-language guidance replaces coordinate-first instructions; source details and taste-score limitations remain.

Applied frontend-design, product-ui-copy-audit, web-design-guidelines and no-ai-slop editing checks. The new copy contains no invented benefits, demand validation or promises of success. Before/after screenshots: [location-ux](location-ux/).

## Geocoding service and limits

Server route `GET /api/locations` uses the fixed [Photon demo API](https://github.com/komoot/photon#demo-server), based on OpenStreetMap. Search is explicitly triggered, not called on every keystroke. Results fill the form only after a user chooses one. Five results maximum, eight-second timeout, bounded five-minute in-memory cache. No API key or paid service is added.

Photon permits reasonable project usage but has no availability guarantee and may throttle requests. Map/manual entry remains available on failure. A larger public rollout should use a provisioned geocoder; this PR does not claim production-scale geocoding reliability. [Photon API documentation](https://github.com/komoot/photon/blob/master/docs/api-v1.md). Attribution remains visible on the map and form. Qloo request construction and ranking rules are unchanged.

## Validation

Tested public preview: https://collab-scout-ngo6iqv3w-circuitstudioais-projects.vercel.app

- 57/57 tests, lint and production build pass.
- Four new tests cover coordinate parsing/ranges, invalid input before network calls, fixed-provider requests with city focus, and upstream failure without invented results.
- Real Toronto browser journey passes: Toronto city selection; Kensington Market and Leslieville lookup; confirmed distinct pins; HTTP 200 live Qloo comparison with 8,363 returned cells; memo download. Counts describe this run, not guaranteed coverage.
- Real city-change checks invalidate pins/results and retain rents. Empty coordinates are rejected. Synthetic lookup failure checks recovery, retention and successful retry. A delayed old-city response cannot restore stale choices or pins. Mobile map placement changes only the selected site; cancellation disarms placement.
- Axe WCAG A/AA: zero violations in tested desktop/mobile form states. No horizontal overflow at 390px or page errors. This is not a full accessibility certification.
- Machine-readable report: [location-ux/validation.json](location-ux/validation.json).

The browser verifier is `scripts/verify-location-ux.mjs <URL>`. It requires Playwright Core with Chromium installed, and axe-core. Set `PLAYWRIGHT_MODULE_PATH` and `AXE_SCRIPT_PATH` if those QA dependencies are installed outside this repository. Intercepted failure responses are labelled in the report; the successful comparison uses real APIs.

## Release status

Review branch only. Production is unchanged. No account system, saved briefs, paid upgrade or hackathon submission is added. The existing Devpost human-verification/login gate remains separate from this UX work.
