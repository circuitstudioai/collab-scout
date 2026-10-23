# Sitebrief — submission copy

## Tagline
Find areas to scout for your next restaurant, with taste evidence and practical checks.

## What it does
Sitebrief starts with a city, a restaurant concept and audience references rather than requiring founders to supply candidate properties. A bounded Gemini tool loop gathers real Qloo map evidence, audience tags/demographics/brands, a nearby-venue comparison and Google-grounded local research.

Deterministic rules enforce radius, existing-outlet buffers, a minimum local popularity floor and a taste screen. The model chooses eligible visit order and check codes; code states actual ranks and ties. Nearby samples are not treated as competitor counts or proof of a market gap.

The owner-specified example is a new Toronto café with an indoor playground. Actual local café references are selected from Qloo's returned sample. No operating details, available properties or parental demand are invented. Users inspect the map/cards and citations, then export a one-page brief or full notes. Known-address comparison remains available separately.

## Who it helps
Restaurant operators, small-chain expansion teams and property advisers need a shortlist of areas before they can inspect commercial units. Sitebrief turns a city and audience references into an inspectable scouting brief. It does not replace premises checks or a professional site study.

## What is different
The workflow is not a general market-analysis chatbot. It selects candidate map points using city-local taste-versus-popularity ranks and operator exclusions, then states the actual evidence and questions for a scouting visit. It can also be called through MCP.

Sitebrief evolved from the repository’s earlier Collab Scout partner-discovery prototype. This entry adds city-first restaurant scouting, geographic selection rules, audience evidence, a bounded Gemini tool workflow, cited research, MCP access and a downloadable expansion brief.

## Why Qloo matters
Qloo resolves the entities and supplies geographic affinity/popularity, taste tags, signed reference demographic affinities, related brands and audience comparison. Removing Qloo removes the actual shortlist evidence. Contrast is a difference in local percentile ranks, not probability lift or measured demand.

## Implementation and limits
Next.js, React, TypeScript, Leaflet, Photon/OpenStreetMap, Qloo and Gemini2.5Flash. Read-only MCP tools expose the restaurant workflow. Source-grounded research is not a guarantee of accuracy, current availability or permissions. No customer validation, revenue forecast, study-cost saving or winning probability is claimed. Quota enforcement remains a separate deferred change.

## Try it
Public demo: https://collab-scout.vercel.app. Click **Try the Toronto playground café**, inspect the agent steps and returned evidence, open source links and download the one-page brief. MCP: `https://collab-scout.vercel.app/api/mcp`. Reused real requests are labelled with their original time.

---
Publisher note, not submission copy: the current three-fix branch is verified on the review preview linked in README. Merge/release it and verify production before describing those fixes as live in the submitted demo. Submission status and acceptance receipts belong in VALIDATION.md, not the pasted product description.
