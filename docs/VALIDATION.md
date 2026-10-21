# Sitebrief validation

2026-10-21 checkpoint.

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
