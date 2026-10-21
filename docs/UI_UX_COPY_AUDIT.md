# Sitebrief content and clarity pass

Requested by Abhi on 2026-10-21. Scope: the active Sitebrief screen, map labels, generated recommendations/errors, exported comparison, and submission draft. This continues the isolated Sitebrief branch and existing PR #4; it does not merge, promote production, or change the scoring algorithm.

## Audience and action

Restaurant owners and commercial realtors should understand what they enter, what the score means, and which location to investigate first. Copy must not imply verified customer demand, available rentals, predicted sales, or a successful live Qloo integration.

## Baseline findings

Locations refer to commit 5b66422 before this pass.

| Location | Quoted copy | No-ai-slop pattern / clarity issue | Edit |
| --- | --- | --- | --- |
| app/SiteDesk.tsx:35 | “A good concept. The right corner.” | Dramatic fragmentation; generic metaphor; implies correctness | State the task: compare restaurant locations |
| app/SiteDesk.tsx:43 | “A shortlist, not a leap of faith.” | Binary contrast and fake-profound kicker | Explain the action needed to see results |
| app/SiteDesk.tsx:45 | “Nearby raw taste affinity” | Undefined technical term | Use Qloo taste score and explain it beside the numbers |
| app/SiteDesk.tsx:38 | “References are audience proxies” | Internal research terminology | Explain that the chosen names describe an assumed audience |
| app/SiteDesk.tsx:46 | “Resolved references” | Implementation detail in a label | Use Brands and places found in Qloo; retain IDs in expanded sources |
| app/SiteDesk.tsx:47 | “Taste is a signal. Not a sales forecast.” | Stacked fragments and rhetorical contrast | Explain scores and limits in complete sentences |
| lib/sites/compare.ts:59 | “The owner must add QLOO_API_KEY” | Server configuration in an end-user error | Offer the sample comparison as a recovery action |
| app/SiteDesk.tsx:37 | “Set the brief” | Unclear task label | Describe your restaurant |
| app/SiteDesk.tsx:48 | “a better-informed shortlist” | Generic closing slogan | Name the product's function |

## Changes

- Direct headline, plain form labels, coordinate/rent instructions, and specific action buttons.
- Defined Qloo taste scores without changing values, normalization, distances, rent exclusions, ties, API parameters, or source data.
- Clear sample notices and a correct pre-comparison map legend.
- Actionable errors that preserve entered values and avoid exposing server setup instructions.
- Technical method and source details remain expandable, including the 2 km matching rule and 4,000-point display limit.
- Plain exported comparison and submission draft. The unverified sponsor integration and lack of customer validation remain disclosed.
- Added a keyboard skip link and small wrapping/numeric-legibility adjustments for the edited copy.

## No-ai-slop self-check

Read the complete skill and eval.md. Reviewed the edited screen and submission draft against the checklist. Preserved the product's meaning, named source, sample disclosure, and numerical details. Removed the named slogans, stacked fragments and rhetorical contrasts. Kept necessary factual negatives about sales and missing data. No new statistics, user quotes, validation claims, or features were introduced. Plain text is used for errors and buttons. Full edited copy and What changed: [COPY.md](COPY.md).

## Validation

Pending final preview browser checks. Prior source passed 44 tests, lint, and a production build. Updated results will be recorded here before completion.

Before screenshots: [desktop](audit-ui/before-desktop.png), [mobile](audit-ui/before-mobile.png).

## References

- Local no-ai-slop skill: workspace repos/no-ai-slop/skills/no-ai-slop/SKILL.md and eval.md.
- UI copy audit, browser automation, frontend design, and Web Interface Guidelines skills.
- Fresh upstream review checklist: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
