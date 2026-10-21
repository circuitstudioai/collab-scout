# Sitebrief judge demo and release gates

## Two-minute sample walkthrough

1. Open the public preview without signing in.
2. Choose **Compare sample locations**. The sample is explicitly made up.
3. Show that Williamsburg has the highest taste score but is over the rent budget.
4. Select a location on the map and review its comparison card.
5. Expand **View data sources** to distinguish sample evidence from live Qloo evidence.
6. Download the comparison, including limitations and follow-up checks.

## Location-entry walkthrough

1. Choose **Use my locations**.
2. Select location B above the map.
3. Choose **Place selected location on map**.
4. Click or tap the map. Only location B's coordinates change; its name and rent remain.
5. Explain that users can also enter coordinates directly. Map placement does not look up an address, rental listing, or rent.
6. Choose **Compare my locations** to run the verified live journey. A failed request must show an error, not sample results.

## Live release gates

- [x] Verify the key against the host supplied for that key, using `X-Api-Key`.
- [x] Resolve a reference; ask for explicit selection when ambiguous and retain its validated Qloo ID.
- [x] Fetch a shared geographic taste map and inspect real response fields and coverage.
- [x] Fetch nearby restaurants and verify radius/location semantics against real responses.
- [x] Complete the hosted live comparison and its export without exposing the key.
- [x] Test an unsupported area or empty result: no invented score or automatic sample replacement.
- [ ] Recheck public access and mobile layout on the exact release deployment.
- [x] Confirm official rules and public MIT source links before final submission.
- [ ] Resolve Devpost's human security verification and complete the entry.
- [ ] Save the submission receipt and public project URL; do not create duplicate entries.

## Delivery targets

The official deadline recorded on October 21 is October 30, 2026 at 11:45pm EDT (October 31 at 03:45 UTC). Source: https://qloo.devpost.com/rules . Internal targets: live acceptance by October 24 and submission by October 28, leaving two days for recovery. These are targets, not completed work.

Do not claim revenue forecasts, local population preferences, comprehensive competitor coverage, verified rental availability, customer interviews, or live integration success without the supporting evidence. An agent-callable tool exists; a separate LLM-driven agent experience is not implemented in Sitebrief.
