# Sitebrief validation

2026-10-21 current checkpoint.

- Six Jest suites: **50/50 tests passed**. Six new synthetic transport tests cover complete request construction, two search response shapes, empty reference IDs, HTTP 401, malformed heatmaps and partial dining failures. They do not prove live API compatibility.
- Lint and local production build pass.
- Map-based placement is available only for custom locations, requires an explicit action, and preserves other locations, names and rents. Cancelling or selecting another site disarms placement. Direct coordinate inputs remain available.
- Public preview: https://collab-scout-g8wx86hsy-circuitstudioais-projects.vercel.app . Chromium verified desktop and 390px mobile placement, cancellation, manual entry and failed-request retention. Zero axe WCAG A/AA violations in the two new tested states; no horizontal mobile overflow or page errors. See map-entry-browser-validation.json and screenshots/map-entry-*.png.
- The failed comparison in this browser check was intercepted with a synthetic HTTP 502; it is not a live-provider acceptance result.
- Empty exact-match reference IDs are rejected before a generic query could lose the intended audience signal. This bug was reproduced red before the guard fix.
- Latest environment metadata lists Qloo credentials for Production, Preview and Development. Historical missing-Preview statements below no longer describe current configuration. Presence is not proof of authentication.
- Abhi supplied a developer key in a private session for a direct test. Its result is pending here; do not copy the key into source, group messages or reports.
- Main, production and Devpost submission remain unchanged. Judge walkthrough and release gates: JUDGE_CHECKLIST.md.

## Earlier October 21 checkpoint (historical)


- Five Jest suites: 44 tests passed, including 14 new decision/evidence tests.
- Lint: passed with no errors or warnings.
- Local production build and final Vercel deployment build passed. Verified app source: 147fe60.
- Live Qloo: FAIL/BLOCKED. Direct search and heatmap requests to https://hackathon.api.qloo.com returned HTTP 401; response reason `API keys mismatch`. No redirects, trailing whitespace/quotes or internal line breaks explain the result. No keys printed.
- Devpost: BLOCKED at Cloudflare security verification in managed browser. No submission made.
- Public preview: https://collab-scout-1b6x4k8zp-circuitstudioais-projects.vercel.app . Homepage, health and agent-tool schema return HTTP 200 without login. Existing production/main unchanged.
- Real Chromium browser checks passed: fixed sample, over-budget highest-affinity exclusion, map selection, memo download and clipboard-failure recovery. No page errors. Map tiles loaded in managed browser.
- Desktop sample-results axe WCAG 2/2.1 A/AA audit: zero violations. A logo accessible-label mismatch was found and corrected before final verification.
- Mobile at 390 × 844: no horizontal overflow. Desktop and mobile screenshots are in screenshots/.
- Hosted API checks: sample 200; modified fixture rejected 422; invalid body rejected 400; tool schema 200. Live Preview request reports missing configuration (503), not synthetic success. The supplied key exists in Production only; direct server-side checks with that key return 401.
- Vercel project SSO protection was changed from all_except_custom_domains to null to make the no-account hackathon preview publicly reviewable. No production code/alias was promoted. No paid upgrade enabled.

## Resume

1. Reload the Vercel Production environment into ignored .env.local after Abhi corrects/activates the key. Never print environment values.
2. Verify the exact minimal GET https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:movie using X-Api-Key. Current response reason is API keys mismatch, with no redirect.
3. Once authentication succeeds, validate exact reference resolution, heatmap shape, restaurant tag support, nearby dining and full POST /api/sites. Endpoint semantics remain assumptions until these pass.
4. Add the verified key server-side to Preview as well as Production, deploy, and repeat the live browser flow. Preserve explicit errors and partial failures; no silent sample fallback.
5. After acceptance, publish/promote the tested release and reconcile main through the authorized PR workflow. Abhi authorized build/publish/submit; no new permission cycle is needed for the agreed scope.
6. Human must resolve Devpost security verification in the hackathon-devpost managed-browser tab. Login state behind that challenge is unverified. Complete the prepared submission only after live gates pass; record the receipt and public URL. Do not repeat completed publication or create duplicate entries.


Meaningful cases covered: over-budget highest affinity excluded; missing rent not inferred; distant evidence rejected; nearest point rather than best score used; ties preserved; invalid coordinates/duplicate IDs rejected; malformed evidence not given a default score; fixed sample never calls network; custom sample refused; missing credentials/upstream errors never fall back; ambiguous reference names rejected; single common heatmap retained through partial dining failure.

## No-ai-slop content pass

App source 8d359a1, public preview https://collab-scout-d1rmwxfks-circuitstudioais-projects.vercel.app . Plain-language content across the homepage, forms, map, results, errors, exported comparison, and submission draft. Calculations and Qloo request parameters unchanged. Full audit: UI_UX_COPY_AUDIT.md; complete edited copy: COPY.md. Browser checks pass with zero axe violations in four tested states and no mobile overflow. Existing sponsor authentication/submission blockers remain unresolved.
