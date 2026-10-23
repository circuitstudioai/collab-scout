# Cold-start recovery acceptance

## Diagnosis

A valid final Gemini response could contain `visitFirst:null` after research failed, even when Qloo had returned eligible points. The previous server accepted it and rendered a generic retry message. A final model exception could also discard the gathered decision evidence. The regression tests reproduced both paths before the fix (null selection and thrown timeout), then passed after recovery was added.

## Behavior

- A live custom brief with eligible Qloo evidence retains a **ranking-only fallback** if optional research or final model selection fails. The top rank is computed from the actual eligible shortlist; ties remain explicit. Missing research stays missing and unavailable tool steps remain visible.
- If no point passes the current rules, no point is invented and no old shortlist is substituted.
- Only the exact canonical `{demo:true}` request can show the saved playground-café reference. Extra custom constraints on that request are rejected. Custom briefs never receive it.
- The saved artifact is compact derived output from the real run recorded on October23 at00:52:45UTC: three highlights, source links, audience evidence and recorded steps. It is not a copied/reconstructed city heatmap. Its original4,292-point count is distinguished from the three displayed saved highlights.
- The saved-run banner, map status, recorded activity, original time and PDF/notes provenance distinguish it from live evidence. Live work gets a60-second demo deadline before host/client timeouts. Gemini/research receive cancellation; no later agent stages run after abort. Already-started Qloo retrieval retains its existing bounded request timeout.
- Warm successful-run caching is separate. Saved recoveries are not cached as fresh successes. Neither cache nor snapshot enforces quotas.

## Evidence

Review preview: https://collab-scout-odq1cmq4f-circuitstudioais-projects.vercel.app (not promoted to production).

- **93 tests in17 suites**, lint and production build pass. Contract regressions cover null/failed decisions, no eligible areas, provider lookup failure, incomplete research, canonical/custom separation, snapshot isolation and the deadline.
- `cold-first/`: first click on a fresh hosted deployment completed with uncached live Qloo/Gemini evidence, four completed tools and an actual selected point.
- `cold-second/`: first click on a second fresh deployment encountered incomplete live research and returned the visibly dated saved reference instead of a missing decision. This is successful recovery, **not** a claim that live research succeeded.
- `final-preview/`: final hosted browser run also exercised labelled saved recovery, including saved provenance in both the PDF and downloaded notes.
- `provider-failure/`: built local server with deliberately invalid provider credentials exercised the full canonical saved fallback. This is an intentionally forced authentication failure, not a normal sponsor-success test.
- Each browser receipt stores its exact URL, result mode and saved metadata. Tested states pass desktop/mobile axe rules with no horizontal overflow/page errors and a structurally valid one-page PDF. Provider-failure PDF explicitly contains the SAVED DEMO marker.
- Earlier PR #7 receipts stay under `docs/quality/` with their original URLs. No ranking-floor, quota-store, Blue Bottle lead preset, backtest, verdict-card or MCP-client integration change is included here.

## Review axes

**Standards — self-review:** preserve provider/model boundaries, bounded tools, server-only credentials, deterministic ranks and existing failure disclosure. The static saved artifact is server-imported and contains no credentials or raw city grid. Main and canonical-demo failure handling remain distinct.

**Owner scope — self-review:** PR #7 merged as94c130c. This follow-up addresses the reported cold-start no-decision issue and labelled saved-demo recovery. The owner-selected playground scenario remains primary. The follow-up PR stays unmerged for review. Quota remains deferred, and no Devpost submission or production promotion is performed.
