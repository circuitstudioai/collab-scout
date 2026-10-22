# Restaurant expansion release review

Baseline: `12ba419` (last recorded Field Atlas acceptance). Review includes working-tree changes and newly added files, against the October 22 execution request and `docs/RESTAURANT_EXPANSION.md`. These are two separate self-review passes, not independent agent reviews.

## Standards

- Followed AGENTS.md: server-side keys only; no invented locations/scores or automatic live-to-sample fallback; deterministic geographic decisions; no outreach or paid upgrades.
- Read installed Next route-handler documentation before adding `/api/research`.
- Provider source links are HTTPS-only and come from grounding metadata, not generated URLs. Search-suggestion HTML is displayed in a script-disabled sandboxed frame.
- The browser accessibility audit caught an invalid `aria-expanded` on a textbox. Removed it before final acceptance.
- No blocking code-standard finding remains. Existing compact JSX style is retained rather than introducing an unrelated formatting rewrite.

## Spec

- Restaurant-first scope supports independent operators, chains and franchise operators. Other industries remain future work, without an unsupported generic dropdown.
- City/address suggestions are automatic as users type. Exact brands resolve before same-name outlets. True ambiguity offers three visible choices or a more specific input; choosing continues the request.
- Outlet rules affect the shortlist and rejection evidence. An all-excluded request does not relax the operator rule.
- Restaurant details inform separate cited research, not fabricated Qloo scores. Research failures preserve live map results.
- **Credential blocker resolved:** after the owner updated the key and redeployed, actual hosted research returned200 with grounded sources and inline citations. Local downloaded placeholders must not be treated as actual deployed credentials. Output review also identified a fictional-brand/business conflation; the prompt now forbids researching or quoting the target concept as if it were an existing business. Research headings and lists render semantically rather than displaying raw Markdown.

Summary: Standards — no remaining blocking finding. Spec — credential blocker resolved on the hosted retry; final updated-code hosted acceptance is required before release. No customer validation claimed.
