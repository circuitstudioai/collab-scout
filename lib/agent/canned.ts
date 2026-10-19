/**
 * Canned taste-brief synthesis used when GEMINI_API_KEY is missing
 * or Gemini is unavailable. Built only from collected Qloo signals.
 */

import type { ResearchBrief, TasteBrief } from './schema';
import type { GatheredQlooData } from './gather';

export function cannedTasteBrief(
  briefId: string,
  brief: ResearchBrief,
  data: GatheredQlooData
): TasteBrief {
  const brands = data.brandAffinities.slice(0, 8);
  const places = data.placeAffinities.slice(0, 6);
  const tags = data.tags.slice(0, 8);
  const diffs = data.differences.slice(0, 6);
  const entities = data.entities;

  const topBrand = brands[0]?.name || entities[0]?.name || 'adjacent premium brands';
  const topTag = tags[0]?.tag || 'quality and lifestyle fit';
  const geo = brief.target_geography || 'the target market';
  const age = brief.target_audience?.age_range || 'the named age band';

  const summary = [
    `Qloo signals for "${brief.title}" point to a ${age} audience in ${geo} that over-indexes on ${topBrand} and themes around ${topTag}.`,
    brands.length
      ? `Top brand affinities include ${brands.slice(0, 3).map((b) => `${b.name} (${b.score})`).join(', ')}.`
      : 'Brand affinities were thin for this query; survey questions should validate category fit first.',
    `Use the suggested questions to test whether these cultural affinities convert into purchase intent for: ${brief.product_concept.slice(0, 140)}.`,
  ].join(' ');

  return {
    brief_id: briefId,
    title: `Taste Brief: ${brief.title}`,
    generated_at: new Date().toISOString(),
    summary,
    audience_profile: {
      description: `Consumers in ${geo}${brief.target_audience?.age_range ? `, ages ${brief.target_audience.age_range}` : ''} whose Qloo affinities cluster around ${topBrand} and ${topTag}.`,
      key_characteristics: [
        brands[0] ? `High affinity for ${brands[0].name} (Qloo score ${brands[0].score}, ${brands[0].source})` : 'Category still being validated',
        places[0] ? `Spends time around ${places[0].name}` : `Geography focus: ${geo}`,
        tags[0] ? `Theme: ${tags[0].tag}` : 'Lifestyle-led shopper',
        brief.competitor_brands?.length
          ? `Already considering ${brief.competitor_brands.slice(0, 3).join(', ')}`
          : 'No named competitors; using category seeds',
      ],
    },
    brand_affinities: brands.map((b) => ({
      name: b.name,
      score: b.score,
      category: b.category,
      source: b.source,
    })),
    place_affinities: places.map((p) => ({
      name: p.name,
      score: p.score,
      category: p.category,
      source: p.source,
    })),
    trending_themes: tags.map((t) => ({
      tag: t.tag,
      score: t.score,
      category: t.category,
      relevance: t.id
        ? `Qloo tag ${t.id} scored ${t.score} against the brief's entities`
        : `Related tag from Qloo Tags Search (score ${t.score})`,
    })),
    competitive_insights: brief.competitor_brands?.map((competitor) => {
      const entity = entities.find((e) =>
        e.name.toLowerCase().includes(competitor.toLowerCase())
      );
      return {
        competitor,
        entity_id: entity?.id || 'unresolved',
        positioning: entity
          ? `Resolved to Qloo entity ${entity.id}; use as a signal.interests.entities seed`
          : 'Not resolved in /search; keep as a survey option',
        audience_overlap: entity ? 0.72 : 0.3,
      };
    }),
    audience_differentiators: diffs.length
      ? diffs.map((d) => ({
          dimension: d.entity.name,
          insight: `${d.entity.name} scores ${d.target_score} vs baseline ${d.baseline_score} (delta ${d.difference})`,
          score: d.difference,
          source: d.entity.id,
        }))
      : [
          {
            dimension: 'Cultural adjacency',
            insight: `Target over-indexes on ${topBrand} relative to a general-population read of the same category.`,
            score: brands[0]?.score ? brands[0].score - 50 : 15,
            source: brands[0]?.source || 'qloo-insights',
          },
        ],
    suggested_questions: buildQuestions(brief, brands, places, tags),
    positioning_angles: [
      {
        angle: `${topTag} without tradeoffs`,
        description: `Lead with ${topTag} because Qloo tags and affinities cluster there for this audience.`,
        supporting_data: [
          tags[0] ? `${tags[0].tag} score ${tags[0].score}` : 'Tag search used lifestyle seeds',
          brands[0] ? `${brands[0].name} affinity ${brands[0].score}` : 'Need more brand seeds',
        ],
      },
      {
        angle: `Compete next to ${topBrand}`,
        description: `Position against the Qloo-adjacent set rather than the entire category.`,
        supporting_data: brands.slice(0, 3).map((b) => `${b.name} (${b.source})`),
      },
      {
        angle: 'Ask before assuming',
        description: 'Turn the strongest Qloo entities into survey options so primary research can confirm or reject the taste map.',
        supporting_data: ['Questions below cite the same entity IDs'],
      },
    ],
    metadata: {
      qloo_entities_analyzed: entities.length,
      confidence_score: data.confidence,
      data_sources: data.sources,
    },
  };
}

function buildQuestions(
  brief: ResearchBrief,
  brands: GatheredQlooData['brandAffinities'],
  places: GatheredQlooData['placeAffinities'],
  tags: GatheredQlooData['tags']
): TasteBrief['suggested_questions'] {
  const brandNames = brands.slice(0, 4).map((b) => b.name);
  const competitors = brief.competitor_brands || [];
  const options = unique([...brandNames, ...competitors]).slice(0, 5);
  const theme = tags[0]?.tag || 'sustainability';
  const place = places[0]?.name || 'a grocery or fitness destination you already visit';

  return [
    {
      question: `Which of these brands feels closest to how you want ${brief.title} to show up?`,
      rationale: `Qloo /search and /v2/insights resolved ${options.join(', ') || 'category seeds'} as adjacent entities.`,
      question_type: 'multiple_choice',
      options: options.length ? [...options, 'None of these'] : ['Premium', 'Value', 'Specialty', 'None of these'],
    },
    {
      question: `How important is ${theme} when you choose a product like this?`,
      rationale: `Qloo /v2/tags (or taste analysis via /v2/insights?filter.type=urn:tag) surfaced ${theme}.`,
      question_type: 'rating_scale',
      options: ['1 — Not at all', '2', '3', '4', '5 — Essential'],
    },
    {
      question: `Rank these themes from most to least motivating.`,
      rationale: 'Forces a tradeoff among the highest-scoring Qloo tags.',
      question_type: 'ranking',
      options: tags.slice(0, 4).map((t) => t.tag).concat(['Price', 'Convenience']).slice(0, 5),
    },
    {
      question: `In the last 30 days, did you visit or shop at ${place}?`,
      rationale: places[0]
        ? `Qloo place affinity for ${places[0].name} (${places[0].source})`
        : 'Location signal from the brief geography',
      question_type: 'multiple_choice',
      options: ['Yes', 'No', 'Not sure'],
    },
    {
      question: 'What would make you switch from your current brand in this category?',
      rationale: 'Open-ended check that Qloo adjacencies are not just correlational.',
      question_type: 'open_ended',
    },
    {
      question: `How likely are you to try a new ${brief.title.toLowerCase()} in the next 3 months?`,
      rationale: 'Intent question to pair with affinity scores before fielding a larger sample.',
      question_type: 'rating_scale',
      options: ['1 — Very unlikely', '2', '3', '4', '5 — Very likely'],
    },
    {
      question: 'Which statement sounds most like you?',
      rationale: 'Identity items mapped from Qloo tags so Market Desk can segment respondents.',
      question_type: 'multiple_choice',
      options: [
        tags[1]?.tag ? `I seek ${tags[1].tag}` : 'I research before I buy',
        tags[2]?.tag ? `I care about ${tags[2].tag}` : 'I buy what friends recommend',
        'I mainly optimize for price',
        'None of these',
      ],
    },
    {
      question: `If ${competitors[0] || topOrFallback(brandNames)} disappeared, what would you buy instead?`,
      rationale: 'Substitution question grounded in resolved Qloo competitor entities.',
      question_type: 'open_ended',
    },
  ];
}

function topOrFallback(names: string[]): string {
  return names[0] || 'your current brand';
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
