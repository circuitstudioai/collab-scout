/**
 * Collab Scout orchestrator: Qloo tool loop → filter/rank → Gemini or canned drafts.
 */

import { APP_NAME } from "../app-config";
import { cannedPartnerShortlist } from "./canned";
import { runScoutLoop } from "./gather";
import {
  generateGeminiText,
  isGeminiConfigured,
  parseJsonObject,
} from "./gemini";
import type { PartnerBrief, PartnerCard, PartnerShortlist } from "./schema";

const SYNTHESIS_INSTRUCTION = `You write co-marketing partner shortlists for consumer brand founders.
Use ONLY the provided Qloo entities, scores, and tags. Do not invent partners or scores.
Write direct, specific sentences. Avoid sales jargon, inflated claims, generic flattery, and promises about revenue or interest.
If data_mode is fallback_mock, label pitches as sample-data drafts and never claim measured audience overlap.
Every partner must be complementary (not a competitor). Pitches are DRAFTS — never imply they were sent.
Return ONLY JSON:
{
  "summary": "2-3 sentences",
  "partners": [{
    "id": "entity_id",
    "name": "",
    "type": "brand|place|artist|media|person",
    "category": "",
    "affinity_score": 0,
    "why_it_fits": "cite entity id, score, tags",
    "qloo_signal": { "entity_id": "", "score": 0, "shared_tags": [], "compare_note": "" },
    "collab_concept": { "type": "co-branded drop|bundle|pop-up|giveaway|content swap", "title": "", "description": "" },
    "outreach_draft": "starts with DRAFT — do not send"
  }]
}`;

export async function scoutPartners(
  brief: PartnerBrief,
): Promise<PartnerShortlist> {
  const runId = brief.id
    ? `run_${brief.id}_${Date.now()}`
    : `run_${Date.now()}`;
  console.log(`[${APP_NAME}] Scouting partners for`, brief.brand_name);

  const signals = await runScoutLoop(brief);
  const canned = cannedPartnerShortlist(runId, brief, signals);

  if (!isGeminiConfigured()) {
    console.log(`[${APP_NAME}] GEMINI_API_KEY missing; canned drafts`);
    return canned;
  }

  try {
    const structured = await generateGeminiText(
      `Founder brief:\n${JSON.stringify(brief)}\n\nRanked complementary partners and Qloo signals:\n${JSON.stringify(
        {
          partners: canned.partners,
          data_mode: canned.metadata.qloo_mode,
          tags: signals.tags,
          compare: signals.compareNotes,
          filtered_out: canned.filtered_out,
        },
        null,
        2,
      )}\nRewrite summary + partner copy. Keep the same partner ids, names, and scores.`,
      SYNTHESIS_INSTRUCTION,
    );
    const parsed = parseJsonObject(structured);
    return mergeGemini(canned, parsed);
  } catch (error) {
    console.warn(
      `[${APP_NAME}] Gemini failed; canned fallback:`,
      error instanceof Error ? error.message : error,
    );
    return canned;
  }
}

function mergeGemini(
  canned: PartnerShortlist,
  parsed: Record<string, unknown>,
): PartnerShortlist {
  const incoming = Array.isArray(parsed.partners)
    ? (parsed.partners as PartnerCard[])
    : [];
  const byId = new Map(incoming.map((p) => [p.id, p]));
  const partners = canned.partners.map((base) => {
    const extra = byId.get(base.id);
    if (!extra) return base;
    return {
      ...base,
      why_it_fits: extra.why_it_fits || base.why_it_fits,
      collab_concept: extra.collab_concept || base.collab_concept,
      outreach_draft: extra.outreach_draft || base.outreach_draft,
    };
  });

  return {
    ...canned,
    summary:
      typeof parsed.summary === "string" ? parsed.summary : canned.summary,
    partners,
    metadata: { ...canned.metadata, synthesis: "gemini-2.5-flash" },
  };
}
