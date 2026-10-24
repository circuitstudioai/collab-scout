# Sitebrief — submission copy

## Tagline
Find areas to scout for your next restaurant, with taste evidence and practical checks.

## What it does
Sitebrief starts with a city, a restaurant concept and audience references rather than requiring candidate properties. A bounded Gemini tool workflow gathers real Qloo map evidence, reference-audience tags and demographic affinities, related brands, a nearby-venue audience comparison and web-source links to inspect.

Deterministic rules enforce the search radius, existing-outlet buffers, a minimum local popularity floor and a taste screen. The server locks a highest-ranked eligible visit point, preserves ties and keeps the research target attached to that exact point. The model chooses research priorities and tool arguments; it cannot rewrite ranks or turn taste into demand.

The lead example is a proposed Blue Bottle expansion into Toronto. The playground café remains a secondary scenario. No operating details, available properties, customer demand or business outcomes are invented. Users inspect the map, source links and City/landlord questions, then export a one-page expansion brief or scouting notes. Known-address comparison remains available separately.

## Who it helps
Restaurant operators, small-chain expansion teams and property advisers need a shortlist before inspecting commercial units. Sitebrief creates an inspectable scouting plan, not a lease recommendation or professional site study.

## Why Qloo matters
Qloo resolves audience entities and supplies geographic affinity/popularity, taste tags, signed reference demographic affinities, related brands and audience comparison. Removing Qloo removes the actual shortlist evidence. Contrast is a difference in local percentile ranks, not probability lift or measured demand. Nearby venues are a ranked sample, not a competitor census or proof of a market gap.

## Implementation and limits
Next.js, React, TypeScript, Leaflet, Photon/OpenStreetMap, Qloo and Gemini 2.5 Flash. Five read-only Model Context Protocol (MCP) tools expose the restaurant workflow.

**Generated local summaries are withheld because source proximity is not verified.** Retrieved links are inspection material, not validated local findings. Geographic verification and richer research remain in a draft follow-up. No customer validation, available-unit verification, revenue forecast, study-cost saving or winning probability is claimed.

Dedicated Free Upstash Redis provides atomic admission for 50 top-level live jobs per UTC day per environment. Store errors and exhaustion fail closed. This is not per-visitor authentication or a hard provider billing cap. Missing mapped category counts remain Unavailable, never invented zeroes.

## Try it
Public demo: https://sitebrief-circuitstudio.vercel.app. Click **Try Blue Bottle in Toronto**, inspect actual tool activity, rank/ties and source links, then download the one-page brief or notes. Reused and saved runs retain their original timestamps and labels.

Source: https://github.com/circuitstudioai/sitebrief. MCP: `https://sitebrief-circuitstudio.vercel.app/api/mcp`.

## Project history
Sitebrief evolved from the repository's earlier Collab Scout partner-discovery prototype. Repository history is preserved rather than presented as a newly created codebase. The current entry is the restaurant-scouting workflow; retired partnership endpoints are not the current product.

This is draft submission copy. No recording, Devpost filing or submission receipt is implied by this document.
