# Sitebrief validation — October 21, 2026

## Current release

- Six Jest suites: **53/53 tests passed**. Three new cases reproduce ambiguous choices, explicit ID selection, and forged/stale ID rejection. Synthetic transport tests remain labelled and are separate from real provider acceptance.
- Lint and local production build passed after reconciling the latest main branch. Vercel builds passed.
- Public-browser live acceptance: search HTTP 409 choice, then full comparison HTTP 200, 1,553 real Qloo heatmap cells, eight nearby restaurants per site, five successful source steps. Selected public entity: Blue Bottle Coffee, 54 W 40th St, New York. Provider results can change.
- Browser journey verifies sample disclosure, no silent preselection, rent exclusion, live memo download with stable source ID, desktop and 390px mobile layouts. Zero axe WCAG A/AA violations in tested selection and mobile-result states, no horizontal overflow, no page errors. See live-browser-validation.json and screenshots/live-*.png.
- Real negative checks: unsupported coordinates have no score/shortlist; forged ID requires a new choice; unrecognized search names never silently select fuzzy results; invalid brief returns 400. See live-negative-validation.json.
- Earlier map-placement checks remain in map-entry-browser-validation.json: selected-site boundaries, cancellation, direct entry and failure retention.
- Public source is MIT licensed. Final review: RELEASE_REVIEW.md. Agent tool schema: GET /api/sites/tool, including HTTP 409 selection/retry instructions.
- Credentials were pulled from the existing encrypted Vercel environment into ignored .env.local for server-side testing. No values were printed, committed, placed in client bundles or added to reports.

## Submission status

Devpost still shows a human-verification challenge in the `sitebrief-devpost` browser tab. Login behind that challenge is unverified. No entry was submitted and no receipt exists. Submission copy is in sitebrief-devpost.md.

Official rules rechecked October 21: deadline October 30, 2026 at 11:45pm EDT; working Qloo-integrated agentic tool, functional demo, public open-source licensed repository and text description required. Keep free access through November 16 judging. https://qloo.devpost.com/rules

## Historical findings superseded

Earlier October 21 builds reported missing configuration or 401 responses. The freshly configured credential now succeeds on the hackathon host. A subsequent 422 was reproduced as ambiguous entity resolution and fixed. An old bare movie-filter probe is not an authentication acceptance test: Qloo requires a valid signal/filter combination.

Past sample/transport tests were not live integration evidence. Current live reports above supersede the old authentication blocker without asserting that historical deployments captured the same credential.
