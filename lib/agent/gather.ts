/**
 * Deterministic Qloo gather step. Runs the same four documented endpoints
 * the agent tools expose so a taste brief always has sourced signals.
 */

import { getQlooClient } from '../qloo/client';
import type { QlooComparisonDifference, QlooEntity, QlooTag } from '../qloo/types';
import type { ResearchBrief } from './schema';

export interface SourcedAffinity {
  name: string;
  score: number;
  category: string;
  source: string;
}

export interface GatheredQlooData {
  entities: QlooEntity[];
  brandAffinities: SourcedAffinity[];
  placeAffinities: SourcedAffinity[];
  tags: QlooTag[];
  differences: QlooComparisonDifference[];
  sources: string[];
  confidence: number;
  mocked: boolean;
}

const NAME_SPLIT = /[,:;]/;

export function extractSearchTerms(brief: ResearchBrief): string[] {
  const terms = [
    ...(brief.competitor_brands || []),
    ...splitNames(brief.title),
    ...splitNames(brief.product_concept),
  ];
  return unique(terms).slice(0, 6);
}

function splitNames(text: string): string[] {
  return text
    .split(NAME_SPLIT)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && /[A-Z]/.test(part) && part.split(/\s+/).length <= 4);
}

export async function gatherQlooData(brief: ResearchBrief): Promise<GatheredQlooData> {
  const client = getQlooClient();
  const sources = new Set<string>();
  const entities: QlooEntity[] = [];

  for (const term of extractSearchTerms(brief)) {
    const result = await client.searchEntities({ query: term, limit: 3 });
    entities.push(...result.entities);
    if (result.entities.length) {
      sources.add('GET /search');
    }
  }

  const uniqueEntities = dedupeEntities(entities);
  const entityIds = uniqueEntities.map((e) => e.id).filter(Boolean).slice(0, 8);
  const audience = {
    age_range: brief.target_audience?.age_range,
    gender: brief.target_audience?.gender,
    geography: brief.target_geography,
  };

  const brandInsights = await client.getInsights({
    audience,
    entity_ids: entityIds,
    filter_type: 'urn:entity:brand',
    categories: ['Brands'],
    limit: 10,
  });
  sources.add('GET /v2/insights (filter.type=urn:entity:brand)');

  const placeInsights = await client.getInsights({
    audience,
    entity_ids: entityIds,
    filter_type: 'urn:entity:place',
    categories: ['Places'],
    limit: 8,
  });
  sources.add('GET /v2/insights (filter.type=urn:entity:place)');

  const tagQuery = brief.product_concept.split(/\s+/).slice(0, 3).join(' ') || 'lifestyle';
  const tags = await client.getTags({
    query: tagQuery,
    entity_ids: entityIds.slice(0, 4),
    limit: 12,
  });
  sources.add(entityIds.length ? 'GET /v2/insights (filter.type=urn:tag)' : 'GET /v2/tags');

  const half = Math.ceil(entityIds.length / 2) || 0;
  const comparison = await client.compareAudiences({
    target_audience: audience,
    entity_ids: entityIds.slice(0, half || entityIds.length),
    baseline_entity_ids: entityIds.slice(half),
    baseline: 'general population',
    limit: 12,
  });
  if (entityIds.length) {
    sources.add('GET /v2/insights (filter.type=urn:demographics)');
  }
  if (entityIds.length >= 2) {
    sources.add('GET /v2/analysis/compare');
  }

  return {
    entities: uniqueEntities,
    brandAffinities: brandInsights.affinities.map((a) => ({
      name: a.entity.name,
      score: a.score,
      category: a.category,
      source: a.entity.id,
    })),
    placeAffinities: placeInsights.affinities.map((a) => ({
      name: a.entity.name,
      score: a.score,
      category: a.category,
      source: a.entity.id,
    })),
    tags: tags.tags,
    differences: comparison.differences,
    sources: Array.from(sources),
    confidence: brandInsights.metadata.confidence,
    mocked: client.isMocked(),
  };
}

function dedupeEntities(entities: QlooEntity[]): QlooEntity[] {
  const seen = new Set<string>();
  const out: QlooEntity[] = [];
  for (const entity of entities) {
    const key = entity.id || entity.name;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entity);
  }
  return out;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
