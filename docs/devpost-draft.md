# Devpost draft — Collab Scout

Status: draft for Abhishek. Do not submit until he approves. Deadline **Fri Oct 30, 2026, 11:45 PM ET**. Video not required by the official rules.

Working name: **Collab Scout** (constant: `APP_NAME` in `lib/app-config.ts`). Theme: **Agents, but with taste**.

## What it does

Collab Scout is an agent for **consumer brand founders** who need a **complementary co-marketing partner** — a brand, venue, or artist that shares an audience but does not sell the same thing.

Input: brand name and/or 1–3 seed brands it resembles, category, geography, optional age, optional competitor exclusions.

Output: a ranked partner shortlist. Each card has a Qloo-cited “why it fits,” a concrete collab concept (drop, bundle, pop-up, giveaway, or content swap), and an **editable outreach draft**. The app never sends email. Founders copy the draft and can mark contacted / replied / declined locally.

The hosted demo needs **no login**. Three seeded brands are clearly fictional (Northline Provisions, Harbor & Pine, Kiln Studio). Not baby products.

## What makes it Qloo-powered

This is not a generic LLM wrapper. Partner ideas come from Qloo’s cultural graph:

1. `GET /search` — resolve seed brands to entity IDs  
2. `GET /v2/insights?filter.type=urn:entity:brand` — audience-overlap brands (signals = seeds + location/demographics)  
3. Optional `urn:entity:place` and `urn:entity:artist` for pop-ups and talent  
4. `GET /v2/tags` / insights `urn:tag` — shared cultural tags used in the “why it fits” line  
5. `GET /v2/analysis/compare` — seed vs candidate overlap  

Auth: `X-Api-Key` against `https://hackathon.api.qloo.com`. No legacy `/recs` or `/recommendations`.

The UI shows a **Qloo-powered trace** of every call so judges can see the chain.

## How the agent works

A tool-calling loop (not a single prompt):

1. Search tools for each seed  
2. Insights tools for brands, places, artists  
3. Tags + compare  
4. Deterministic competitor filter (same category or user exclusions) and affinity rank  
5. Gemini 2.5 Flash writes concepts and draft pitches, or a canned fallback if `GEMINI_API_KEY` is missing  

The filter is the product idea: last year’s field had many “taste brief / market research” wrappers. Collab Scout uses taste to **pick who to collaborate with**, then writes the first outreach — without pretending to send it.

## What’s next

- Host the demo on Vercel with the live Qloo key (`qloo_mode: live` on `GET /api/partners`)  
- Optional Gemini key for richer copy  
- Public MIT repo (human publishes; this draft is not a submission)  
- Devpost form + optional video  
- After the hackathon: more partner types, CRM export, still no auto-send
