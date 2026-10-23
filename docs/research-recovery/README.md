# Cited research and visit-order recovery

## Result

Research/decision application code tested in five fresh runs at `bb50c4042555d21d31c2fcc01d9c8001381803d2` on:

https://collab-scout-fkzbg80ya-circuitstudioais-projects.vercel.app

Five fresh uncached runs returned live cited research and a rank-one visit. Every research report in this batch was partial: omitted text stays omitted, and only retained aligned cited passages appear. No sources-only, ranking-only, cached or saved-demo outcome is counted as a live-research success. This small batch is evidence, not an uptime or factual-accuracy guarantee.

| Request | Mode | Total seconds | Visit rank | Retained citations per researched area |
|---|---|---:|---:|---|
| canonical-playground | live-cited | 16.435 | 1 | 12 |
| blue-bottle | live-cited | 37.917 | 1 | 21, 14, 14 |
| custom-playground | live-cited | 13.374 | 1 | 23 |
| blue-bottle | live-cited | 29.006 | 1 | 8, 14, 9 |
| custom-playground | live-cited | 14.987 | 1 | 22 |

Receipts: [five fresh runs](fresh-runs.json), individual `run-*.json`, [hosted synthetic states](hosted-fixtures/validation.json), [official MCP SDK](mcp/validation.json), and [safe runtime events](runtime-logs.json). Hosted end-to-end demo receipts are under `hosted-demo/`; that check reports its own cache/saved/live mode separately.

## Diagnosis and correction

- The four reported production research failures cannot be attributed conclusively: the deployment-scoped log query returned no retained function failures for that window. Other Gemini tools working does not establish Search grounding success.
- Code inspection confirmed two validation attempts, whole-report rejection after a forbidden sentence, and suppression of the underlying error in the agent. New preview logs show actual numeric, regulatory and unsupported-market-claim omissions while usable cited passages survive.
- Reports now retain whole safe sentences covered by exact provider grounding text. Citation endpoints are rebuilt after removals. Ambiguous repeated segments, ungrounded sentences and unsafe source URLs cannot become inline citations. Provider links can survive without prose, but are labelled sources to inspect, not validated findings.
- Failures expose safe categories: missing configuration, timeout, rate limit, provider error, missing grounding, validation failure and cancellation. Attempt logs contain generated IDs, durations, outcome/rule names, counts and numeric provider status; no prompts, keys or raw response/error bodies.
- Research keeps at most two attempts within a forty-second total budget. A later failed summary attempt does not discard earlier sources-only recovery. The canonical sixty-second live deadline remains.
- Visit order defaults to the highest-ranked eligible point, preserving ties. A lower-ranked practical visit needs an exact retained topical cited fact naming that area or a verified nearby venue. Questions, city-wide instructions, wrong-area/source references and invented quotes do not override rank. The decision shows any accepted practical quote and source.
- Partial/source-only notices and safe failures appear in the UI. Research for another area remains visible with a separate-area label. Notes preserve report status; the one-page PDF labels sources-only recovery and includes any practical decision quote.
- The stale README preview line was removed in the earlier recovery commit. README/method/architecture now describe these changes; the obsolete Devpost publisher footer is removed without submitting anything.

## Final rendered preview

The final UI application commit is `a467905a5bda7592ff89a4d472d88926d8d7721e`:

https://collab-scout-gzr151629-circuitstudioais-projects.vercel.app

Its additional hosted end-to-end playground run passed with `cached:false` and no saved-demo substitution. Desktop/mobile axe checks found no configured-rule violations, no horizontal overflow or page errors; source links, one-page PDF, notes and popularity-change invalidation passed. Hosted synthetic recovery fixtures also passed on this exact preview, including long notices on mobile. These additional browser checks are separate from the five-run backend batch above.

## Regression and browser checks

- **108 tests / 18 suites**, lint and production build passed after the final application change. Observed red-to-green regressions cover safe passage retention, lower-rank choices without evidence, and the generic permit checklist caught in the first hosted batch. A later full browser run caught horizontal overflow from long research notices inheriting a timing-label no-wrap style. The mobile fixture reproduced the overflow against the old preview, then passed after a dedicated wrapping layout (`a467905`). The research/decision backend did not change after the five-run batch.
- Additional coverage: absent grounding and bounded retries; rate-limit/timeout privacy; cancellation and total deadline; sources surviving a later timeout; Unicode/repeated-segment alignment; sources-only labeling and no successful-research cache; ties; and valid/invalid area-specific practical quotations.
- Hosted synthetic UI transport fixtures explicitly exercise sources-only, partial, off-selected-area research, provider failure and cited-choice states. Sources-only desktop/mobile axe checks have no violations under the configured rules; no overflow/page errors were found. Notes and PDFs retain truthful labels, and tested PDFs remain one page. These fixtures are not live provider acceptance.
- Fresh official MCP SDK initialization/tool listing and real Qloo exploration passed; this does not claim every chat client was installed.

## Iteration evidence and limits

The initial five-run batch at application commit `3aa1932` also returned cited research, but its first canonical run accepted a generic city-wide permit checklist as a reason for rank three. Those receipts are retained in [initial](initial/fresh-runs.json), not relabelled as final acceptance. A regression then failed for that checklist, the area-specific factual-evidence rule was tightened, and the five fresh runs above were repeated on the new deployment.

Standards — self-review: retrieval, report reconstruction, decision validation and presentation remain separate. Inputs and model output stay bounded/schema-checked; source links still come only from grounding metadata. No credentials are in the evidence artifacts.

Scope — self-review: this extends existing PR #8, preserving its cold-start recovery and original saved-demo provenance. The playground café remains the primary demo. Quota, shared storage, new infrastructure, production changes, merge and Devpost submission are excluded.

Citations, guard patterns and area-name checks are not semantic truth validation. Users must verify source geography, freshness and applicability. Availability, customer demand, zoning permission and commercial success remain unproven. The separate deferred per-visitor quota remains open.
