/**
 * Taste-brief orchestrator.
 * 1. Gather live (or fallback mock) Qloo signals
 * 2. Synthesize with Gemini 2.5 Flash when GEMINI_API_KEY is set
 * 3. Otherwise use the canned synthesizer
 */

import { cannedTasteBrief } from './canned';
import { gatherQlooData, type GatheredQlooData } from './gather';
import { generateGeminiText, isGeminiConfigured, parseJsonObject } from './gemini';
import type { ResearchBrief, TasteBrief } from './schema';

const SYNTHESIS_INSTRUCTION = `You are a market research analyst. Turn Qloo cultural intelligence into a taste brief.
Every claim must cite a Qloo entity id or tag id from the provided data. Do not invent entities or scores.
Return ONLY valid JSON with this shape:
{
  "summary": "2-3 sentences",
  "audience_profile": { "description": "...", "key_characteristics": ["..."] },
  "brand_affinities": [{ "name": "", "score": 0, "category": "", "source": "entity_id" }],
  "place_affinities": [{ "name": "", "score": 0, "category": "", "source": "entity_id" }],
  "trending_themes": [{ "tag": "", "score": 0, "category": "", "relevance": "" }],
  "audience_differentiators": [{ "dimension": "", "insight": "", "score": 0, "source": "" }],
  "suggested_questions": [{ "question": "", "rationale": "", "question_type": "multiple_choice|rating_scale|open_ended|ranking", "options": ["..."] }],
  "positioning_angles": [{ "angle": "", "description": "", "supporting_data": ["..."] }]
}`;

export async function generateTasteBrief(brief: ResearchBrief): Promise<TasteBrief> {
  const briefId = brief.id || `brief_${Date.now()}`;
  console.log('[Agent] Gathering Qloo signals for', brief.title);

  const data = await gatherQlooData(brief);
  console.log('[Agent] Qloo mode:', data.mocked ? 'FALLBACK mock' : 'live');
  console.log('[Agent] Sources:', data.sources.join(', '));

  if (isGeminiConfigured()) {
    try {
      const structured = await synthesizeWithGemini(brief, data);
      return finalizeBrief(briefId, brief, data, structured);
    } catch (error) {
      console.warn(
        '[Agent] Gemini synthesis failed; using canned fallback:',
        error instanceof Error ? error.message : error
      );
    }
  } else {
    console.log('[Agent] GEMINI_API_KEY missing; using canned fallback');
  }

  return cannedTasteBrief(briefId, brief, data);
}

async function synthesizeWithGemini(
  brief: ResearchBrief,
  data: GatheredQlooData
): Promise<Record<string, unknown>> {
  const prompt = `Research brief:
${JSON.stringify(brief, null, 2)}

Qloo signals (already fetched; do not invent new ones):
${JSON.stringify(
    {
      entities: data.entities,
      brand_affinities: data.brandAffinities,
      place_affinities: data.placeAffinities,
      tags: data.tags,
      differences: data.differences,
      sources: data.sources,
    },
    null,
    2
  )}

Write the taste brief JSON now.`;

  const text = await generateGeminiText(prompt, SYNTHESIS_INSTRUCTION);
  return parseJsonObject(text);
}

function finalizeBrief(
  briefId: string,
  brief: ResearchBrief,
  data: GatheredQlooData,
  structured: Record<string, unknown>
): TasteBrief {
  const canned = cannedTasteBrief(briefId, brief, data);
  const audience = structured.audience_profile as TasteBrief['audience_profile'] | undefined;

  return {
    brief_id: briefId,
    title: `Taste Brief: ${brief.title}`,
    generated_at: new Date().toISOString(),
    summary: typeof structured.summary === 'string' ? structured.summary : canned.summary,
    audience_profile: audience?.description ? audience : canned.audience_profile,
    brand_affinities: asArray(structured.brand_affinities, canned.brand_affinities),
    place_affinities: asArray(structured.place_affinities, canned.place_affinities),
    trending_themes: asArray(structured.trending_themes, canned.trending_themes),
    competitive_insights: canned.competitive_insights,
    audience_differentiators: asArray(
      structured.audience_differentiators,
      canned.audience_differentiators
    ),
    suggested_questions: asArray(structured.suggested_questions, canned.suggested_questions),
    positioning_angles: asArray(structured.positioning_angles, canned.positioning_angles),
    metadata: {
      qloo_entities_analyzed: data.entities.length,
      confidence_score: data.confidence,
      data_sources: data.sources,
    },
  };
}

function asArray<T>(value: unknown, fallback: T): T {
  return Array.isArray(value) && value.length > 0 ? (value as T) : fallback;
}
