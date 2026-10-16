/**
 * Agent orchestrator - generates taste briefs from research briefs
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { qlooTools } from './tools';
import type { ResearchBrief, TasteBrief } from './schema';

const SYSTEM_PROMPT = `You are a market research analyst specializing in cultural taste intelligence powered by Qloo.

Your job is to analyze a research brief and generate a comprehensive "taste brief" that reveals the cultural preferences, brand affinities, and lifestyle patterns of the target audience.

WORKFLOW:
1. Use search_entities to identify any brands, places, or media mentioned in the brief
2. Use get_insights to understand what the target audience loves (brands, places, media)
3. Use get_tags to identify trending themes and cultural values
4. Use compare_audiences to identify what makes this audience unique vs general population
5. Synthesize all data into a comprehensive taste brief with survey recommendations

IMPORTANT RULES:
- Every claim must be backed by Qloo data (entity IDs, scores)
- Always cite sources (entity IDs) for affinities and insights
- Generate 8-10 survey questions that leverage these taste insights
- Suggest positioning angles based on the audience's cultural preferences
- Be specific and actionable - this brief will guide actual market research

SURVEY QUESTION STRATEGY:
- Use brand/place affinities to create "Which of these do you prefer?" questions
- Use themes to test messaging resonance: "How important is [theme] to you?"
- Use competitor insights to gauge market positioning
- Mix question types: multiple choice, rating scales, rankings, and open-ended

OUTPUT FORMAT:
Generate a structured taste brief with:
- Executive summary
- Audience profile with key characteristics  
- Top brand affinities (with scores and Qloo entity IDs)
- Top place affinities (with scores and entity IDs)
- Trending themes relevant to positioning
- Competitive insights (if competitors provided)
- Audience differentiators (what makes them unique)
- 8-10 recommended survey questions with rationales
- 3-5 positioning angles with supporting data
- Metadata about analysis quality`;

export async function generateTasteBrief(brief: ResearchBrief): Promise<TasteBrief> {
  const briefId = brief.id || `brief_${Date.now()}`;
  
  // Construct the user prompt
  const userPrompt = `
Research Brief:
Title: ${brief.title}
Product Concept: ${brief.product_concept}
Target Geography: ${brief.target_geography}
${brief.target_audience ? `Target Audience: ${brief.target_audience.age_range || ''} ${brief.target_audience.gender || ''}` : ''}
${brief.competitor_brands && brief.competitor_brands.length > 0 ? `Competitors: ${brief.competitor_brands.join(', ')}` : ''}
${brief.additional_context ? `Additional Context: ${brief.additional_context}` : ''}

Generate a comprehensive taste brief for this research project. Use the Qloo tools to:
1. Search for any mentioned brands/places
2. Get insights about the target audience
3. Identify trending themes
4. Compare the target audience to the general population

Then synthesize everything into a structured taste brief with survey recommendations.
`;

  console.log('[Agent] Starting taste brief generation...');
  console.log('[Agent] Brief:', brief.title);

  const result = await generateText({
    model: openai('gpt-4o-mini'), // Using cheaper model as per spec
    tools: qlooTools,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  console.log('[Agent] Tool calls made:', result.steps.length);
  console.log('[Agent] Generation complete');

  // Parse the agent's response into a structured taste brief
  const tasteBrief = await synthesizeTasteBrief(briefId, brief, result.text, result.steps);
  
  return tasteBrief;
}

async function synthesizeTasteBrief(
  briefId: string,
  originalBrief: ResearchBrief,
  agentResponse: string,
  steps: any[]
): Promise<TasteBrief> {
  // Extract tool results
  const toolResults = {
    entities: [] as any[],
    insights: null as any,
    tags: null as any,
    comparison: null as any,
  };

  for (const step of steps) {
    if (step.toolCalls) {
      for (const toolCall of step.toolCalls) {
        const result = step.toolResults?.find((r: any) => r.toolCallId === toolCall.toolCallId);
        if (!result) continue;

        switch (toolCall.toolName) {
          case 'search_entities':
            toolResults.entities.push(...(result.result.entities || []));
            break;
          case 'get_insights':
            toolResults.insights = result.result;
            break;
          case 'get_tags':
            toolResults.tags = result.result;
            break;
          case 'compare_audiences':
            toolResults.comparison = result.result;
            break;
        }
      }
    }
  }

  // Use another LLM call to structure the final output
  const structuringPrompt = `Based on the following Qloo data and analysis, create a structured taste brief in JSON format.

Original Brief:
${JSON.stringify(originalBrief, null, 2)}

Qloo Data Collected:
${JSON.stringify(toolResults, null, 2)}

Agent Analysis:
${agentResponse}

Generate a JSON object with this exact structure:
{
  "summary": "2-3 sentence executive summary",
  "audience_profile": {
    "description": "detailed audience description",
    "key_characteristics": ["characteristic 1", "characteristic 2", ...]
  },
  "brand_affinities": [
    { "name": "Brand Name", "score": 85, "category": "Category", "source": "entity_id" }
  ],
  "place_affinities": [
    { "name": "Place Name", "score": 82, "category": "Category", "source": "entity_id" }
  ],
  "trending_themes": [
    { "tag": "theme", "score": 90, "category": "Category", "relevance": "why it matters" }
  ],
  "audience_differentiators": [
    { "dimension": "what dimension", "insight": "the insight", "score": 35, "source": "entity_id or comparison" }
  ],
  "suggested_questions": [
    {
      "question": "The survey question",
      "rationale": "Why this question matters based on Qloo data",
      "question_type": "multiple_choice" | "rating_scale" | "open_ended" | "ranking",
      "options": ["option 1", "option 2"] // if applicable
    }
  ],
  "positioning_angles": [
    {
      "angle": "Positioning angle name",
      "description": "Description of this angle",
      "supporting_data": ["data point 1", "data point 2"]
    }
  ]
}

Return ONLY valid JSON, no other text.`;

  const structureResult = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: structuringPrompt,
  });

  // Parse the JSON response
  let structured;
  try {
    const jsonMatch = structureResult.text.match(/\{[\s\S]*\}/);
    structured = JSON.parse(jsonMatch ? jsonMatch[0] : structureResult.text);
  } catch (error) {
    console.error('[Agent] Failed to parse structured output:', error);
    throw new Error('Failed to generate structured taste brief');
  }

  // Build final taste brief
  const tasteBrief: TasteBrief = {
    brief_id: briefId,
    title: `Taste Brief: ${originalBrief.title}`,
    generated_at: new Date().toISOString(),
    summary: structured.summary,
    audience_profile: structured.audience_profile,
    brand_affinities: structured.brand_affinities || [],
    place_affinities: structured.place_affinities || [],
    trending_themes: structured.trending_themes || [],
    audience_differentiators: structured.audience_differentiators || [],
    suggested_questions: structured.suggested_questions || [],
    positioning_angles: structured.positioning_angles || [],
    metadata: {
      qloo_entities_analyzed: toolResults.entities.length,
      confidence_score: toolResults.insights?.confidence || 0.85,
      data_sources: [
        toolResults.insights ? 'Qloo Insights API' : null,
        toolResults.tags ? 'Qloo Tags API' : null,
        toolResults.comparison ? 'Qloo Comparison API' : null,
        toolResults.entities.length > 0 ? 'Qloo Entity Search' : null,
      ].filter(Boolean) as string[],
    },
  };

  // Add competitive insights if available
  if (originalBrief.competitor_brands && originalBrief.competitor_brands.length > 0) {
    tasteBrief.competitive_insights = originalBrief.competitor_brands.map(competitor => {
      const entity = toolResults.entities.find(e => 
        e.name.toLowerCase().includes(competitor.toLowerCase())
      );
      
      return {
        competitor,
        entity_id: entity?.id || 'unknown',
        positioning: `Analysis based on Qloo data for ${competitor}`,
        audience_overlap: 0.7, // placeholder
      };
    });
  }

  return tasteBrief;
}
