# Qloo Agentic Hackathon: "Market Desk Taste Agent" (Circuit Studio)

Status: DRAFT for Abhishek's approval. Nothing registered, no form filled.
Hackathon: https://qloo.devpost.com/ (rules: /rules)
Deadline: **Fri Oct 30, 2026, 11:45 PM ET**. Judging Nov 2–16; winners ~Nov 23.
Prizes: 3 cash, $15K / $6K / $4K (one prize per project). ~1.5K registrants.

## 1. What it is
A public, open-source agent tool that adds Qloo cultural/taste intelligence to market research: given a product concept and a target market, the agent returns audience affinities, adjacent brands, trending tags and demographic skews. It runs alongside Market Desk (circuit-analyst.vercel.app) so a survey or research brief gets a "taste lens" next to the respondent data.

## 2. Separation from Market Desk
- New separate public repo `market-desk-taste-agent` (MIT). Market Desk's private code is not copied in.
- Integration point: Market Desk calls the public agent's HTTP endpoint (`POST /api/taste-brief`) or embeds a "Taste lens" panel via link/iframe. Any change to Market Desk itself is a small, private PR by Circuit Dev (needs his OK before merging to main).
- The hosted demo must be fully functional on its own (judges can't log into Market Desk), with seeded sample briefs.

## 3. Rules that shape the build (official rules)
- Must integrate the Qloo API and (a) be an agentic tool, (b) be built on an agent framework, or (c) add Qloo to an existing agent. We do (a)+(b), and it plugs into Market Desk.
- New, or existing project significantly updated during Sep 30 – Oct 30. This repo is new.
- Required: a functional demo **hosted and fully published externally** (no local-only or private access); a public repo with an **open-source license visible in About**; a text description explaining what makes it "Qloo-powered". **No video required.**
- API key works only against `https://hackathon.api.qloo.com` (not staging/prod). Use the **Insights API** + supporting lookup/entity APIs; do **not** use legacy `/recommendations` or `/recs` (Qloo developer guide).
- Entrants: individual, team or organization. Canada OK (Quebec excluded).
- IP: must be original and solely owned. No sponsor license grant found in the rules.

## 4. Getting the Qloo API key (needs Abhishek's OK)
1. He registers on Devpost for the Qloo hackathon (his account).
2. He submits Qloo's API key request **Google Form**, linked from the developer guide: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide#getting-your-api-key
3. Key arrives by email "typically within a few business days". Check spam/junk.
4. **Timing risk:** with Oct 30 as the deadline, the form should go in by **Fri Oct 16 or Mon Oct 19** at the latest. Until the key arrives we build against a mocked Qloo client.
5. Key is stored only in Vercel env vars / box secrets, never in the repo.

## 5. Product spec
- Input: product/concept description, target geography, optional audience (age/gender buckets) and competitor brands.
- Agent (tool-calling loop):
  1. `qloo_search_entities`: resolve brands/places/media named in the brief to Qloo entity IDs.
  2. `qloo_insights`: affinities for the target audience across categories (brands, places, media, artists).
  3. `qloo_tags`: trending/related tags to suggest positioning themes.
  4. `qloo_compare` / audience analysis: how the target differs from the general population.
  5. Synthesize: "Taste brief" with sourced Qloo signals, suggested survey questions for Market Desk, and positioning angles. Every claim links to the Qloo entity/score it came from (no unsupported claims).
- Output: web report + JSON for Market Desk; "Send questions to Market Desk" button (deep link).
- Stack: Next.js + TypeScript on Vercel; agent framework (Vercel AI SDK tools, or LangGraph JS if needed); cheap model (Grok fast/mini or Composer-built) for synthesis.

## 6. Judging criteria map (equally weighted)
| Criterion | How we score |
|---|---|
| Technological Implementation (use of Qloo) | Multiple Qloo endpoints chained by the agent; entity resolution → insights → tags → comparison; cached, rate-limit aware |
| Design | Complete flow: brief in → taste brief out → push to survey; hosted, no login |
| Potential Impact | Small brands and researchers can't afford big panels; taste data + a fast survey makes research actionable |
| Quality of the Idea | Non-obvious use: Qloo drives *which questions to ask* in primary research, not just recommendations |

## 7. Repo structure
```
market-desk-taste-agent/
  LICENSE (MIT)  README.md  .env.example (QLOO_API_KEY, QLOO_BASE_URL=https://hackathon.api.qloo.com, LLM_API_KEY)
  app/ (/, /brief/[id])  app/api/taste-brief/route.ts
  lib/qloo/ (client, insights, search, tags, mock)  lib/agent/ (tools, loop, schema)
  seed/sample-briefs.json  tests/
```

## 8. Milestones (ET)
| # | Date | Deliverable |
|---|---|---|
| M0 | Fri Oct 16 | Abhishek OKs plan; he registers on Devpost + submits Qloo Google Form |
| M1 | Mon Oct 19 | Repo, MIT license, mocked Qloo client, agent loop skeleton, Vercel deploy |
| M2 | Thu Oct 22 | Real Qloo key wired in (if received); entity search + insights live |
| M3 | Mon Oct 26 | Tags/comparison, taste brief UI, Market Desk deep link |
| M4 | Wed Oct 28 | Polish, seeded examples, README + "Qloo-powered" description draft |
| M5 | Thu Oct 29 | Draft Devpost submission ready for his approval |
| Submit | Thu Oct 29 (buffer) / hard stop **Fri Oct 30, 11:45 PM ET** | He submits |

## 9. Model plan
Composer default for the build; Grok fast for the runtime synthesis; total model spend target ≤ $10.

## 10. Risks
- API key delay → mock client from day 1; escalate if no key by Oct 22.
- Hackathon key only works on the hackathon base URL → env-configured base URL.
- Thin fit (Qloo = taste/culture data) → frame clearly as consumer/market research, not B2B.
