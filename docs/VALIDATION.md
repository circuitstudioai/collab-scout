# Sitebrief validation

2026-10-21 checkpoint.

- Five Jest suites: 44 tests passed, including 14 new decision/evidence tests.
- Lint: passed with no errors or warnings.
- Initial production build passed. Updated map build pending final confirmation.
- Live Qloo: FAIL/BLOCKED. Direct search and heatmap requests to https://hackathon.api.qloo.com returned HTTP 401; response reason `API keys mismatch`. No redirects, trailing whitespace/quotes or internal line breaks explain the result. No keys printed.
- Devpost: BLOCKED at Cloudflare security verification in managed browser. No submission made.
- Browser and hosted acceptance: pending.

Meaningful cases covered: over-budget highest affinity excluded; missing rent not inferred; distant evidence rejected; nearest point rather than best score used; ties preserved; invalid coordinates/duplicate IDs rejected; malformed evidence not given a default score; fixed sample never calls network; custom sample refused; missing credentials/upstream errors never fall back; ambiguous reference names rejected; single common heatmap retained through partial dining failure.
