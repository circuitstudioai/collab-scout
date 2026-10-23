# Playground café — recording plan

Owner-specified scenario: **a new café with an indoor playground**, using popular Toronto cafés as audience references. No existing outlets, prices or opening hours are assumed. PR6 stays unmerged for review.

## Suggested 90-second story (edit waiting time transparently)

1. **Decision.** “Where should we scout for a new café with an indoor playground in Toronto?” Click **Try the Toronto playground café**. The example runs live the first time; a reused real run is explicitly labelled with its original timestamp.
2. **Qloo evidence.** Show the actual Toronto café names and addresses automatically selected from the returned café-tagged sample by popularity. These are reference assumptions, not proven family demand or an exhaustive city leaderboard.
3. **Agent activity.** Show actual tool completions: map audience contrast, audience profile, compare a nearby venue, research an eligible area. The agent receives real tool results before selecting the area to research. No staged animation.
4. **Decision and trade-off.** Show local affinity-minus-popularity percentile contrast. Explain “unusual relative to this city's returned points,” not probability lift or unmet demand. Do not force an outside-downtown result. Inspect the audience card and distinguish signed demographic scores from resident percentages.
5. **Practical checks.** Open the cited research. Café taste cannot verify playground suitability, available premises, usable floor area, access or permits. Sources and follow-up visit questions should make those gaps actionable.
6. **Artifact.** Download the one-page expansion brief and open a source. “A defensible scouting visit, not an instruction to sign a lease.” Full notes retain the detailed sources and request trace.

## Recording gates

Use the exact hosted preview recorded in `docs/agent/validation.json` and `docs/agent/ui-validation.json`. Require a complete real four-tool run, provider-grounded research citations, structurally valid one-page PDF, and no tested desktop/mobile accessibility errors. UI replay validation must not be described as a new live API test.

If a provider fails, show that honestly or retry. Never splice failed research into a claimed successful run. Warm-server caching is best-effort, not durable quota protection. Do not open credential/account panels while recording. Production promotion and Devpost submission are separate actions.
