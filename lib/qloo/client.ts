/**
 * Qloo API client.
 *
 * Live mode follows the hackathon developer guide:
 *   GET https://hackathon.api.qloo.com/...
 *   Header: X-Api-Key
 *   Endpoints: /search, /v2/insights, /v2/tags, /v2/analysis/compare
 *   Never /recommendations or /recs
 *
 * Mock is a labelled fallback when QLOO_API_KEY is missing or QLOO_USE_MOCK=true.
 */

import { cacheKey, TtlCache } from './cache';
import {
  QLOO_ENDPOINTS,
  resolveCacheTtlMs,
  resolveQlooApiKey,
  resolveQlooBaseUrl,
  shouldUseQlooMock,
} from './config';
import { qlooGet } from './http';
import {
  appTypesToSearchUrns,
  compareResponseToDifferences,
  demographicsToDifferences,
  extractList,
  mapAgeRange,
  mapGender,
  normalizeAffinity,
  normalizeEntity,
  normalizeTag,
} from './map';
import { MockQlooClient } from './mock';
import type {
  CompareAudiencesRequest,
  GetInsightsRequest,
  GetTagsRequest,
  QlooComparisonResponse,
  QlooInsightsResponse,
  QlooSearchResult,
  QlooTagsResponse,
  SearchEntitiesRequest,
} from './types';

const responseCache = new TtlCache();

export class QlooClient {
  private apiKey: string;
  private baseUrl: string;
  private useMock: boolean;
  private mockClient?: MockQlooClient;
  private cacheTtlMs: number;

  constructor(options?: {
    apiKey?: string;
    baseUrl?: string;
    useMock?: boolean;
    cacheTtlMs?: number;
  }) {
    this.apiKey = options?.apiKey ?? resolveQlooApiKey();
    this.baseUrl = (options?.baseUrl || resolveQlooBaseUrl()).replace(/\/$/, '');
    this.useMock = shouldUseQlooMock(options?.useMock);
    this.cacheTtlMs = options?.cacheTtlMs ?? resolveCacheTtlMs();

    if (this.useMock) {
      this.mockClient = new MockQlooClient();
      console.log(
        '[Qloo] FALLBACK: using mocked Qloo client (QLOO_API_KEY missing or QLOO_USE_MOCK=true)'
      );
    }
  }

  /**
   * GET /search?query=&types=&take=
   */
  async searchEntities(request: SearchEntitiesRequest): Promise<QlooSearchResult> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.searchEntities(request);
    }

    const params = {
      query: request.query,
      types: appTypesToSearchUrns(request.types),
      take: String(Math.min(request.limit || 10, 50)),
    };

    const raw = await this.cachedGet(QLOO_ENDPOINTS.search, params);
    const entities = extractList(raw, [
      'results.entities',
      'results',
      'entities',
    ]).map(normalizeEntity);

    return { entities, total: entities.length };
  }

  /**
   * GET /v2/insights?filter.type=&signal...&take=
   * Insights is GET with query params, not POST.
   */
  async getInsights(request: GetInsightsRequest): Promise<QlooInsightsResponse> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.getInsights(request);
    }

    const filterType = resolveFilterType(request);
    const params: Record<string, string | undefined> = {
      'filter.type': filterType,
      take: String(Math.min(request.limit || 20, 50)),
    };

    const entityIds = (request.entity_ids || []).filter(Boolean);
    const tagIds = (request.tag_ids || []).filter(Boolean);
    if (entityIds.length) {
      params['signal.interests.entities'] = entityIds.join(',');
    }
    if (tagIds.length) {
      params['signal.interests.tags'] = tagIds.join(',');
    }

    const geography = request.audience?.geography;
    if (geography) {
      params['signal.location.query'] = geography;
    }

    const age = mapAgeRange(request.audience?.age_range);
    if (age) {
      params['signal.demographics.age'] = age;
    }
    const gender = mapGender(request.audience?.gender);
    if (gender) {
      params['signal.demographics.gender'] = gender;
    }

    // Insights requires at least one valid signal or filter.
    if (!entityIds.length && !tagIds.length && !geography) {
      params['signal.location.query'] = 'United States';
    }

    const raw = await this.cachedGet(QLOO_ENDPOINTS.insights, params);
    const affinities = extractList(raw, ['results.entities', 'entities']).map(
      (item, index) => normalizeAffinity(item, index + 1)
    );

    return {
      affinities,
      audience: request.audience || {},
      metadata: {
        total_results: affinities.length,
        confidence: affinities.length > 0 ? 0.86 : 0.4,
      },
    };
  }

  /**
   * GET /v2/tags?filter.query=&take=
   * When entity IDs are present, also run taste analysis:
   * GET /v2/insights?filter.type=urn:tag&signal.interests.entities=
   */
  async getTags(request: GetTagsRequest): Promise<QlooTagsResponse> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.getTags(request);
    }

    const entityIds = (request.entity_ids || []).filter(Boolean);
    let tags;

    if (entityIds.length) {
      const raw = await this.cachedGet(QLOO_ENDPOINTS.insights, {
        'filter.type': 'urn:tag',
        'signal.interests.entities': entityIds.join(','),
        take: String(Math.min(request.limit || 15, 50)),
      });
      tags = extractList(raw, ['results.tags', 'tags']).map(normalizeTag);
    } else {
      const query = request.query || request.categories?.[0] || 'lifestyle';
      const raw = await this.cachedGet(QLOO_ENDPOINTS.tags, {
        'filter.query': query,
        take: String(Math.min(request.limit || 15, 50)),
      });
      tags = extractList(raw, ['results.tags', 'tags', 'results']).map(normalizeTag);
    }

    if (request.trending_only) {
      tags = tags.filter((t) => t.trending);
    }

    return {
      tags,
      entity_id: entityIds[0],
      metadata: { total_results: tags.length },
    };
  }

  /**
   * Audience comparison via documented endpoints:
   * - GET /v2/insights?filter.type=urn:demographics&signal.interests.entities=
   * - GET /v2/analysis/compare?a.signal.interests.entities=&b.signal.interests.entities=
   */
  async compareAudiences(request: CompareAudiencesRequest): Promise<QlooComparisonResponse> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.compareAudiences(request);
    }

    const entityIds = (request.entity_ids || []).filter(Boolean);
    const baselineIds = (request.baseline_entity_ids || []).filter(Boolean);
    const differences = [];

    if (entityIds.length) {
      const demo = await this.cachedGet(QLOO_ENDPOINTS.insights, {
        'filter.type': 'urn:demographics',
        'signal.interests.entities': entityIds.join(','),
      });
      differences.push(...demographicsToDifferences(demo));
    }

    if (entityIds.length && baselineIds.length) {
      const compared = await this.cachedGet(QLOO_ENDPOINTS.compare, {
        'a.signal.interests.entities': entityIds.join(','),
        'b.signal.interests.entities': baselineIds.join(','),
      });
      differences.push(...compareResponseToDifferences(compared));
    }

    const limited = differences.slice(0, request.limit || 20);

    return {
      differences: limited,
      target_audience: request.target_audience,
      baseline: request.baseline || 'general population',
      metadata: { total_results: limited.length },
    };
  }

  isMocked(): boolean {
    return this.useMock;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async cachedGet(
    path: string,
    params: Record<string, string | undefined>
  ): Promise<unknown> {
    const compact: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value) compact[key] = value;
    }
    const key = cacheKey('GET', path, compact);
    const cached = responseCache.get<unknown>(key);
    if (cached !== undefined) {
      return cached;
    }

    const data = await qlooGet({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      path,
      params: compact,
    });
    responseCache.set(key, data, this.cacheTtlMs);
    return data;
  }
}

function resolveFilterType(request: GetInsightsRequest): string {
  if (request.filter_type) {
    return request.filter_type;
  }
  const category = (request.categories?.[0] || '').toLowerCase();
  if (category.includes('place')) return 'urn:entity:place';
  if (category.includes('artist')) return 'urn:entity:artist';
  if (category.includes('media') || category.includes('movie')) return 'urn:entity:movie';
  return 'urn:entity:brand';
}

let qlooClientInstance: QlooClient | null = null;

export function getQlooClient(): QlooClient {
  if (!qlooClientInstance) {
    qlooClientInstance = new QlooClient();
  }
  return qlooClientInstance;
}

export function resetQlooClient(): void {
  qlooClientInstance = null;
}

export function clearQlooCache(): void {
  responseCache.clear();
}
