/**
 * Agentic Qloo tool loop for Collab Scout.
 * Each step is a documented GET. Traces are returned for the UI panel.
 */

import { getQlooClient } from '../qloo/client';
import type { QlooAffinity, QlooEntity, QlooTag } from '../qloo/types';
import type { PartnerBrief, QlooTraceEntry } from './schema';

export interface ScoutSignals {
  seedEntities: QlooEntity[];
  brandAffinities: QlooAffinity[];
  placeAffinities: QlooAffinity[];
  artistAffinities: QlooAffinity[];
  tags: QlooTag[];
  compareNotes: string[];
  traces: QlooTraceEntry[];
  mocked: boolean;
}

function trace(
  traces: QlooTraceEntry[],
  path: string,
  params: Record<string, string>,
  summary: string,
  mocked: boolean
): void {
  traces.push({
    id: `qloo_${traces.length + 1}`,
    at: new Date().toISOString(),
    method: 'GET',
    path,
    params,
    summary,
    mocked,
  });
}

export function searchTermsFor(brief: PartnerBrief): string[] {
  const terms = [brief.brand_name, ...(brief.seed_brands || [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const term of terms) {
    const key = term.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(term.trim());
  }
  return out.slice(0, 4);
}

export async function runScoutLoop(brief: PartnerBrief): Promise<ScoutSignals> {
  const client = getQlooClient();
  const mocked = client.isMocked();
  const traces: QlooTraceEntry[] = [];
  const seedEntities: QlooEntity[] = [];

  for (const query of searchTermsFor(brief)) {
    const result = await client.searchEntities({
      query,
      types: ['brand'],
      limit: 3,
    });
    seedEntities.push(...result.entities);
    trace(
      traces,
      '/search',
      { query, types: 'urn:entity:brand', take: '3' },
      result.entities.length
        ? `Resolved ${result.entities.map((e) => e.name).join(', ')}`
        : `No entity for “${query}” (fictional names often miss; seeds still work)`,
      mocked
    );
  }

  const uniqueSeeds = dedupe(seedEntities);
  const entityIds = uniqueSeeds.map((e) => e.id).filter(Boolean).slice(0, 8);
  const audience = {
    age_range: brief.audience_age,
    geography: brief.target_geography,
  };

  const brands = await client.getInsights({
    audience,
    entity_ids: entityIds,
    filter_type: 'urn:entity:brand',
    categories: ['Brands'],
    limit: 16,
  });
  trace(
    traces,
    '/v2/insights',
    {
      'filter.type': 'urn:entity:brand',
      'signal.interests.entities': entityIds.join(',') || '(location only)',
      'signal.location.query': brief.target_geography,
      ...(brief.audience_age ? { 'signal.demographics.age': brief.audience_age } : {}),
    },
    `${brands.affinities.length} audience-overlap brands`,
    mocked
  );

  const places = await client.getInsights({
    audience,
    entity_ids: entityIds,
    filter_type: 'urn:entity:place',
    categories: ['Places'],
    limit: 8,
  });
  trace(
    traces,
    '/v2/insights',
    {
      'filter.type': 'urn:entity:place',
      'signal.interests.entities': entityIds.join(',') || '(location only)',
      'signal.location.query': brief.target_geography,
    },
    `${places.affinities.length} venue / place ideas`,
    mocked
  );

  const artists = await client.getInsights({
    audience,
    entity_ids: entityIds,
    filter_type: 'urn:entity:artist',
    categories: ['Artists'],
    limit: 6,
  });
  trace(
    traces,
    '/v2/insights',
    {
      'filter.type': 'urn:entity:artist',
      'signal.interests.entities': entityIds.join(',') || '(location only)',
    },
    `${artists.affinities.length} artist / talent ideas`,
    mocked
  );

  const tags = await client.getTags({
    query: brief.category,
    entity_ids: entityIds.slice(0, 4),
    limit: 12,
  });
  trace(
    traces,
    entityIds.length ? '/v2/insights' : '/v2/tags',
    entityIds.length
      ? { 'filter.type': 'urn:tag', 'signal.interests.entities': entityIds.slice(0, 4).join(',') }
      : { 'filter.query': brief.category },
    `${tags.tags.length} shared / related tags`,
    mocked
  );

  const compareNotes: string[] = [];
  const partnerIds = brands.affinities
    .map((a) => a.entity.id)
    .filter((id) => id && !entityIds.includes(id))
    .slice(0, 4);
  if (entityIds.length && partnerIds.length) {
    const compared = await client.compareAudiences({
      target_audience: audience,
      entity_ids: entityIds,
      baseline_entity_ids: partnerIds,
      baseline: 'candidate partners',
      limit: 8,
    });
    compareNotes.push(
      ...compared.differences.slice(0, 4).map(
        (d) => `${d.entity.name}: target ${d.target_score} vs baseline ${d.baseline_score} (${d.entity.id})`
      )
    );
    trace(
      traces,
      '/v2/analysis/compare',
      {
        'a.signal.interests.entities': entityIds.join(','),
        'b.signal.interests.entities': partnerIds.join(','),
      },
      compared.differences.length
        ? `Compared seeds vs ${partnerIds.length} candidate partners`
        : 'Compare returned no rows',
      mocked
    );
    if (entityIds.length) {
      traces.push({
        id: `qloo_${traces.length + 1}`,
        at: new Date().toISOString(),
        method: 'GET',
        path: '/v2/insights',
        params: { 'filter.type': 'urn:demographics', 'signal.interests.entities': entityIds.join(',') },
        summary: 'Demographic skew for seed entities (part of compare)',
        mocked,
      });
    }
  }

  return {
    seedEntities: uniqueSeeds,
    brandAffinities: brands.affinities,
    placeAffinities: places.affinities,
    artistAffinities: artists.affinities,
    tags: tags.tags,
    compareNotes,
    traces,
    mocked,
  };
}

function dedupe(entities: QlooEntity[]): QlooEntity[] {
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
