/**
 * Map app-level types onto documented Qloo parameters and parse live responses.
 */

import type {
  QlooAffinity,
  QlooComparisonDifference,
  QlooEntity,
  QlooEntityType,
  QlooTag,
} from './types';

export const APP_TYPE_TO_URN: Record<QlooEntityType, string> = {
  brand: 'urn:entity:brand',
  place: 'urn:entity:place',
  media: 'urn:entity:movie',
  artist: 'urn:entity:artist',
  person: 'urn:entity:person',
};

export function appTypesToSearchUrns(types?: QlooEntityType[]): string | undefined {
  if (!types || types.length === 0) {
    return undefined;
  }
  return types.map((t) => APP_TYPE_TO_URN[t] || t).join(',');
}

export function urnToAppType(urn?: string): QlooEntityType {
  const value = (urn || '').toLowerCase();
  if (value.includes('brand')) return 'brand';
  if (value.includes('place') || value.includes('destination') || value.includes('locality')) return 'place';
  if (value.includes('artist')) return 'artist';
  if (value.includes('person') || value.includes('actor')) return 'person';
  if (
    value.includes('movie') ||
    value.includes('tv') ||
    value.includes('book') ||
    value.includes('podcast') ||
    value.includes('media')
  ) {
    return 'media';
  }
  return 'brand';
}

/**
 * Map freeform age ranges from research briefs onto documented
 * signal.demographics.age values.
 */
export function mapAgeRange(ageRange?: string): string | undefined {
  if (!ageRange) return undefined;
  const text = ageRange.toLowerCase().replace(/\s/g, '');
  const buckets = new Set<string>();

  const addIf = (cond: boolean, bucket: string) => {
    if (cond) buckets.add(bucket);
  };

  const numbers = text.match(/\d+/g)?.map(Number) || [];
  const min = numbers[0];
  const max = numbers[1] ?? numbers[0];

  if (text.includes('35_and_younger') || text.includes('36_to_55') || text.includes('55_and_older')) {
    return ageRange;
  }

  if (min !== undefined) {
    addIf(min <= 24 || (max !== undefined && max <= 24), '24_and_younger');
    addIf(overlaps(min, max, 25, 29), '25_to_29');
    addIf(overlaps(min, max, 30, 34), '30_to_34');
    addIf(overlaps(min, max, 35, 44), '35_to_44');
    addIf(overlaps(min, max, 45, 54), '45_to_54');
    addIf(max !== undefined ? max >= 55 : min >= 55, '55_and_older');
  }

  if (buckets.size === 0) {
    if (min !== undefined && min <= 35) return '35_and_younger';
    if (min !== undefined && min >= 55) return '55_and_older';
    return '36_to_55';
  }

  return Array.from(buckets).join(',');
}

function overlaps(min: number, max: number | undefined, a: number, b: number): boolean {
  const hi = max ?? min;
  return min <= b && hi >= a;
}

export function mapGender(gender?: string): 'male' | 'female' | undefined {
  if (!gender) return undefined;
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'female') return g;
  return undefined;
}

export function toAffinityScore(raw: unknown): number {
  if (typeof raw !== 'number' || Number.isNaN(raw)) {
    return 50;
  }
  if (raw <= 1 && raw >= -1) {
    return Math.max(0, Math.min(100, Math.round(((raw + 1) / 2) * 100)));
  }
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function popularityToScore(raw: unknown): number {
  if (typeof raw !== 'number' || Number.isNaN(raw)) {
    return 50;
  }
  if (raw <= 1 && raw >= 0) {
    return Math.max(0, Math.min(100, Math.round(raw * 100)));
  }
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function extractList(data: unknown, keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  for (const key of keys) {
    const parts = key.split('.');
    let cur: unknown = obj;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') {
        cur = undefined;
        break;
      }
      cur = (cur as Record<string, unknown>)[part];
    }
    if (Array.isArray(cur)) return cur;
  }
  return [];
}

export function normalizeEntity(raw: unknown): QlooEntity {
  const row = (raw || {}) as Record<string, unknown>;
  const properties = (row.properties || {}) as Record<string, unknown>;
  const id = String(row.entity_id || row.id || '');
  const typeUrn = String(row.subtype || row.type || '');
  const description =
    (typeof properties.short_description === 'string' && properties.short_description) ||
    (typeof properties.description === 'string' && properties.description) ||
    (typeof row.disambiguation === 'string' && row.disambiguation) ||
    undefined;

  return {
    id,
    name: String(row.name || 'Unknown'),
    type: urnToAppType(typeUrn),
    category: typeof row.subtype === 'string' ? row.subtype : typeUrn || undefined,
    description,
  };
}

export function normalizeAffinity(raw: unknown, rank?: number): QlooAffinity {
  const row = (raw || {}) as Record<string, unknown>;
  const query = (row.query || {}) as Record<string, unknown>;
  const entity = normalizeEntity(raw);
  const score = popularityToScore(
    query.affinity ?? query.score ?? row.affinity ?? row.popularity ?? 0.5
  );
  return {
    entity,
    score,
    category: entity.category || entity.type,
    rank,
  };
}

export function normalizeTag(raw: unknown): QlooTag {
  const row = (raw || {}) as Record<string, unknown>;
  const query = (row.query || {}) as Record<string, unknown>;
  const name = String(row.name || row.tag || row.tag_id || row.id || 'unknown');
  const score = popularityToScore(query.affinity ?? row.affinity ?? row.popularity ?? 0.5);
  const category = String(row.subtype || row.type || row.category || 'tag');
  return {
    id: String(row.tag_id || row.id || name),
    tag: name,
    score,
    category,
    trending: Boolean(row.trending),
  };
}

export function demographicsToDifferences(raw: unknown): QlooComparisonDifference[] {
  const rows = extractList(raw, [
    'results.demographics',
    'demographics',
    'results.entities',
  ]);
  const diffs: QlooComparisonDifference[] = [];

  for (const item of rows) {
    const row = (item || {}) as Record<string, unknown>;
    const query = (row.query || {}) as Record<string, unknown>;
    const age = (query.age || {}) as Record<string, number>;
    const gender = (query.gender || {}) as Record<string, number>;
    const entityId = String(row.entity_id || row.id || 'demographic');
    const name = String(row.name || entityId);

    for (const [bucket, value] of Object.entries({ ...age, ...gender })) {
      if (typeof value !== 'number') continue;
      const score = toAffinityScore(value);
      diffs.push({
        entity: {
          id: entityId,
          name: `${name} · ${bucket}`,
          type: 'brand',
          category: 'demographics',
        },
        target_score: score,
        baseline_score: 50,
        difference: score - 50,
        category: 'Demographics',
      });
    }
  }

  return diffs;
}

export function compareResponseToDifferences(raw: unknown): QlooComparisonDifference[] {
  const rows = extractList(raw, [
    'results.entities',
    'results.comparison',
    'results.tags',
    'entities',
  ]);
  return rows.map((item, index) => {
    const affinity = normalizeAffinity(item, index + 1);
    return {
      entity: affinity.entity,
      target_score: affinity.score,
      baseline_score: 50,
      difference: affinity.score - 50,
      category: affinity.category,
    };
  });
}
