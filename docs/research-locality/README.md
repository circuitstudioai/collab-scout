# Recorded source/locality acceptance — 2026-10-24

This is acceptance tooling, **not a runtime locality repair**. PR10 remains draft and research remains geographically unaccepted. The old five-run result established only mechanical field counts, source diversity and locked-point identity. It did not prove that facilities or listings were near that point.

## Results and scope

`recorded-five-run-audit.json` replays the existing application-head `247de04` receipts from `/tmp/sitebrief-recovery-research-20261024`. No fresh research, provider calls, quota reset, configuration or application behavior changed. All five runs pass mechanical checks; **zero of five have complete source/locality review**. All fifteen retained findings lack the new exact-bound review records. Missing records are unknown, not proof that every finding is false. Earlier official-page evidence of distant Jimmie Simpson and Matty Eckler facilities remains valid negative evidence; approximate park coordinates are not exact facility entrances.

The explicit **1 km audit radius** is a conservative experiment scope, not a newly approved product-wide distance policy. This audit has no full-release success result. Cache/fallback, custom targets, actual live browser/MCP acceptance and owner release gates remain separate.

## Reproduce without paid calls

```sh
node --test scripts/lib/research-acceptance.test.mjs
node scripts/audit-recorded-research.mjs /tmp/sitebrief-recovery-research-20261024 1
```

The audit prints JSON and exits **1** for missing or rejected source/locality evidence, including the current batch. That is an expected product acceptance failure, not controller failure. The fresh-run collector now uses `mechanicalPass` / `mechanicalPassed` rather than ambiguous `pass` / `passed`; it explicitly reports locality not audited and release acceptance not established.

## Trusted review record

An optional third argument names a JSON array of **independently reviewed source observations**, not model output. Each retained field needs a matching review with:

- `field`, exact `text`, exact `target` (`areaId`, `latitude`, `longitude`) and a `sourceUrl` matching a cited provider source for that field.
- `supportsFinding: true`, `coversEntireFinding: true`, `observedText` copied from the actually inspected source, and `observedAt` in ISO date/time format.
- `locations: [{subject, sourceUrl, latitude, longitude, uncertaintyKm}]` covering **every** subject and geographic extent asserted by the entire finding. Each location needs independently inspected address/location evidence, not just a street centroid or nearby similarly named park. A compound finding cannot be approved by locating only its nearest subject.

Every subject's distance plus uncertainty must fit within the explicit audit radius. A broad street name, uninspected redirect, Search snippet, arbitrary geocoder match or the model's own coordinates is not sufficient. Review records are trusted input: this script does not fetch pages or verify the truth of an auditor's observations. It guards exact claim/source/point binding and computes the bound; it is not automatic fraud detection or a runtime proximity guarantee. Do not manufacture reviews simply to turn the gate green.

Next engineering dependency: obtain source-bound subject address/location evidence for each new facility/listing, define bounded retrieval/caching and uncertainty behavior within existing call/deadline budgets, then integrate runtime rejection/recovery. Do not repeat prompt-only radius trials or deploy this offline checker as if it fixed research.
