# Current restaurant expansion release

The October 22 restaurant expansion scope is defined in [RESTAURANT_EXPANSION.md](RESTAURANT_EXPANSION.md). It supersedes conflicting historical descriptions below, including no-Gemini and mandatory manual entity-selection statements. The primary discovery and secondary address-comparison journeys remain supported.

# Product requirements — Collab Scout

Source of truth for this document: the current tree (`README.md`, `AGENTS.md`, `PROJECT_SUMMARY.md`, `docs/SETUP.md`, `docs/devpost-draft.md`, `uploads/qloo-plan_6717.md` for hackathon rules / deadline, and the implementation under `app/`, `lib/`, `seed/`). Do not treat the pre-pivot Market Desk plan in `uploads/qloo-plan_6717.md` as current product scope.

Working name: **Collab Scout** (`APP_NAME` in `lib/app-config.ts`). Theme: **Agents, but with taste**. Canonical repo: [github.com/circuitstudioai/collab-scout](https://github.com/circuitstudioai/collab-scout). MIT. Hosted on **Vercel**.

## Problem

Consumer brand founders need a **complementary co-marketing partner** — a brand, venue, or artist that shares an audience but does not sell the same thing. Last year’s Qloo field had many “taste brief / market research” wrappers. Collab Scout uses taste to **pick who to collaborate with**, then writes the first outreach draft — without sending it.

This is **not** a market-research dashboard, survey tool, or Market Desk taste-brief product.

## Target users

**Consumer brand founders** looking for co-marketing partners. The hosted demo needs **no login**.

## Goals

1. Resolve a founder brief (name and/or 1–3 seed brands, category, geography, optional age, optional competitor exclusions) through Qloo’s cultural graph.
2. Return a ranked shortlist of **non-competing** brands, places, and artists with overlapping audiences.
3. For each partner: a Qloo-cited “why it fits,” a concrete collab concept, and an **editable outreach draft**.
4. Show a **Qloo-powered trace** of every hackathon GET so a judge (or another agent) can see the chain.
5. Keep outreach on the founder’s machine. The app **never sends email** and never contacts anyone.

## Core user flows

### Seeded demo (primary judge path)

1. Open `/`. Three fictional founders (coffee, home scent, ceramics) from `seed/sample-brands.json`.
2. Open one (`/scout/[id]`) → **Find complementary partners** → `POST /api/partners`.
3. Confirm same-category / excluded brands are filtered, pitches say `DRAFT`, **Copy draft** works, and local contacted / replied / declined status works.
4. Open the **Qloo-powered trace**.

### Custom brief

1. `/scout/custom` — enter brand name, category, 1–3 seed brands, geography, optional age, optional exclusions.
2. Continue into the same scout runner. The form text states the brief is not stored on a server beyond this request.

### JSON API

`POST /api/partners` with the partner-brief fields in `lib/agent/schema.ts`. Health: `GET /api/partners` (mode, Gemini fallback, disclaimer). Retired: `GET`/`POST /api/taste-brief` returns **410**.

## Functional requirements

| Requirement | What the code actually does |
|---|---|
| Find non-competing brands with overlapping audiences via Qloo | Sequential GET loop in `lib/agent/gather.ts`: `/search` (seeds) → `/v2/insights` for `urn:entity:brand`, `urn:entity:place`, `urn:entity:artist` → tags (`/v2/tags` or insights `urn:tag`) → `/v2/analysis/compare` (plus demographics insights). Auth: `X-Api-Key` on `https://hackathon.api.qloo.com`. GET only. **Do not** call `/recommendations` or `/recs`. |
| Competitor filter + affinity rank | Deterministic, no network (`lib/agent/rank.ts`). Drops seed entities/names, founder `exclude_brands`, and same-category **brands** (category string overlap + groups in `CATEGORY_GROUPS`). Places / artists / persons are not dropped for category overlap. Rank: affinity descending, then name. |
| Collab concepts | One of: co-branded drop, bundle, pop-up, giveaway, content swap. Gemini 2.5 Flash rewrites copy from ranked Qloo signals, or canned templates if `GEMINI_API_KEY` is missing or the call fails. Gemini is instructed not to invent partners or scores; merge keeps canned ids, names, and scores. |
| Pitch drafts that are never sent | Every draft includes `DRAFT`. UI copy / clipboard only. Metadata disclaimer: never sends email or contacts partners. No mailer, no CRM send. |
| Transparent log of every Qloo call | `qloo_trace` on the shortlist: method `GET`, path, params, summary, mocked flag. Rendered as the “Qloo-powered trace” panel. |
| Live or labelled mock | No `QLOO_API_KEY` or `QLOO_USE_MOCK=true` → labelled mock fallback so the demo still runs. |
| Local outreach status | `contacted` / `replied` / `declined` in **this browser** (`localStorage` key `${APP_SLUG}:outreach:${runId}:${partnerId}`). |

Partner brief fields (`lib/agent/schema.ts`): `brand_name`, `category`, `target_geography` (required); `id`, `description`, `seed_brands` (max 3), `audience_age`, `exclude_brands` (optional).

## Non-goals / out of scope

Documented as **not** this product, or explicitly forbidden for agents working in this repo:

- Market Desk / taste-brief / survey tool. Do not depend on Market Desk. Do not reintroduce Market Desk deep links. `/api/taste-brief` is gone.
- Sending email, auto-emailing partners, or contacting anyone.
- Login, accounts, database, or Supabase in the **current** hackathon demo (`docs/SETUP.md`: “No database. No auth. No Supabase required.”).
- Legacy Qloo `/recommendations` or `/recs`.
- Hardcoded API keys. Do not set `OPENAI_API_KEY` (Gemini is called directly).
- Publishing or submitting Devpost from an agent (human owner approval).
- Baby-product demo brands (constraint on seeded data, not a runtime category filter).

`uploads/qloo-plan_6717.md` describes the **retired** Market Desk Taste Agent (taste brief, survey questions, iframe/deep link). That plan is historical context and hackathon-rules reference only.

## Success criteria and hackathon demo constraints

Official rules summarized in `uploads/qloo-plan_6717.md` (still apply): integrate the Qloo API as an agentic tool (or agent framework / add Qloo to an existing agent); new or significantly updated during the window; **hosted, fully published** demo (not local-only); public repo with a visible open-source license; a text description of what makes it Qloo-powered. **No video required.** Entrants: individual, team, or organization; Canada OK (Quebec excluded).

**Deadline: Fri Oct 30, 2026, 11:45 PM ET.** Judging Nov 2–16; winners ~Nov 23 (plan file).

Demo constraints from current docs and `seed/sample-brands.json`:

- No login.
- Three **made-up** consumer brands: Northline Provisions (specialty coffee), Harbor & Pine (home fragrance), Kiln Studio (tableware). **Not baby products.**
- Works on mock Qloo data if no API key is set.
- Judge checks: competitors filtered, pitches say DRAFT, copy works, local status works, trace lists Qloo GETs.
- Health check when keys are set: `GET /api/partners` shows `qloo_mode: "live"` and `gemini: "gemini-2.5-flash"`.

Hackathon judging criteria (equally weighted, from the plan file): Technological Implementation (use of Qloo), Design, Potential Impact, Quality of the Idea. Current scoring intent (`docs/devpost-draft.md`): chain multiple documented GETs; complete brief → shortlist → draft flow; taste picks **who to collaborate with**, not another research brief.

## Open questions

These are unresolved in the repo; do not invent answers:

1. Devpost form (and optional video) is a **draft** for Abhishek — do not submit until he approves (`docs/devpost-draft.md`).
2. Docs say host on Vercel but do not record a public demo URL yet.
3. After the hackathon, `docs/devpost-draft.md` lists “more partner types, CRM export, still no auto-send.” No design for those is in the tree.
4. Working name lives in `APP_NAME` so it is easy to rename — final public name is not locked beyond the current constant.
5. Whether outreach tracking stays in `localStorage` or moves onto Circuit Studio’s standard Supabase Auth + DB is not implemented (see roadmap).

## Future roadmap

**Current persistence:** outreach status is `localStorage` only. Custom briefs are not stored on a server beyond the request. No database and no auth in this repo.

Circuit Studio’s **standard stack** (for after-hackathon work, not present in the current demo unless already listed above):

- **Gemini** — `GEMINI_API_KEY` in Vercel env, called **directly** from the Next.js server (`@google/genai`, model `gemini-2.5-flash`). No Gemini proxy. Already how synthesis works.
- **Vercel** — already the documented host (Next.js import of this GitHub repo).
- **Supabase DB / backend** — not used today (`docs/SETUP.md`). The natural later home for shortlists and outreach status if they must leave the browser.
- **Supabase Auth** — not used today (demo is no-login). Only relevant if accounts are added later.

After-hackathon items already written down: more partner types, CRM export, **still no auto-send**. Do not add email send or Market Desk integration as “roadmap” without a new product decision.
