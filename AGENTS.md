<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Current authorized product: Sitebrief

Abhi authorized building, publishing and submitting the restaurant-site comparison pivot on 2026-10-21. This supersedes old Collab Scout review-only/no-submission instructions for this task. Preserve existing main until release gates pass. Product source of truth: docs/SITEBRIEF.md. Validation: docs/VALIDATION.md. Submission copy: docs/sitebrief-devpost.md.

No customer validation is claimed. No keys in source or client bundles. Qloo host is https://hackathon.api.qloo.com with X-Api-Key. No invented entities, taste scores, availability, demand or financial projections. Sample mode stays fixed and clearly disclosed; never replace failed live calls with mock evidence. Do not submit until live sponsor integration and published demo acceptance pass. No paid upgrades authorized. Never contact brokers/owners or send outreach.

Current routes: / and /api/sites; POST /api/sites is an agent-callable decision tool. Keep score decisions deterministic. Gemini is not used by Sitebrief. The previous Collab Scout source remains for continuity; its docs are historical rather than current requirements.
