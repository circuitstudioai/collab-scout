/**
 * Tests for Qloo client (mock fallback + live GET contract)
 */

import { QlooClient, clearQlooCache } from '../lib/qloo/client';
import { QLOO_AUTH_HEADER } from '../lib/qloo/config';
import { QlooApiError } from '../lib/qloo/errors';

describe('QlooClient mock fallback', () => {
  let client: QlooClient;

  beforeEach(() => {
    client = new QlooClient({ useMock: true });
  });

  it('labels itself as mocked', () => {
    expect(client.isMocked()).toBe(true);
  });

  it('searches for entities by query', async () => {
    const result = await client.searchEntities({
      query: 'lululemon',
      types: ['brand'],
      limit: 5,
    });

    expect(result.entities.length).toBeGreaterThan(0);
    expect(result.entities[0]).toHaveProperty('id');
    expect(result.entities[0]).toHaveProperty('name');
    expect(result.entities[0]).toHaveProperty('type');
  });

  it('returns empty results for unknown queries', async () => {
    const result = await client.searchEntities({
      query: 'nonexistentbrand12345xyz',
      limit: 5,
    });
    expect(result.entities).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('returns audience insights', async () => {
    const result = await client.getInsights({
      audience: { age_range: '25-40', geography: 'United States' },
      limit: 10,
    });
    expect(result.affinities.length).toBeGreaterThan(0);
    expect(result.affinities[0].score).toBeGreaterThan(0);
    expect(result.affinities[0].score).toBeLessThanOrEqual(100);
  });

  it('returns trending tags', async () => {
    const result = await client.getTags({ trending_only: true, limit: 5 });
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.tags[0].trending).toBe(true);
  });

  it('compares audiences against a baseline', async () => {
    const result = await client.compareAudiences({
      target_audience: { age_range: '25-40', geography: 'United States' },
      baseline: 'general population',
      limit: 10,
    });
    expect(result.differences.length).toBeGreaterThan(0);
    expect(result.differences[0]).toHaveProperty('difference');
  });
});

describe('QlooClient live contract', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearQlooCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearQlooCache();
  });

  it('is not mocked when useMock is false and a key is supplied', () => {
    const live = new QlooClient({ useMock: false, apiKey: 'test_key' });
    expect(live.isMocked()).toBe(false);
  });

  it('sends GET /search with X-Api-Key and query params', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          { entity_id: 'AAA', name: 'Nike', subtype: 'urn:entity:brand', popularity: 0.9 },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new QlooClient({
      useMock: false,
      apiKey: 'test_key',
      baseUrl: 'https://hackathon.api.qloo.com',
    });
    const result = await client.searchEntities({ query: 'Nike', types: ['brand'], limit: 3 });

    expect(result.entities[0].name).toBe('Nike');
    expect(result.entities[0].id).toBe('AAA');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('https://hackathon.api.qloo.com/search?');
    expect(String(url)).toContain('query=Nike');
    expect(String(url)).toContain('types=urn%3Aentity%3Abrand');
    expect(init.method).toBe('GET');
    expect(init.headers[QLOO_AUTH_HEADER]).toBe('test_key');
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('sends GET /v2/insights with filter.type (not POST /recommendations)', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: {
          entities: [
            {
              entity_id: 'BBB',
              name: 'Patagonia',
              subtype: 'urn:entity:brand',
              query: { affinity: 0.81 },
            },
          ],
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new QlooClient({
      useMock: false,
      apiKey: 'test_key',
      baseUrl: 'https://hackathon.api.qloo.com',
    });
    const result = await client.getInsights({
      audience: { geography: 'United States', age_range: '25-40' },
      entity_ids: ['AAA'],
      filter_type: 'urn:entity:brand',
    });

    expect(result.affinities[0].entity.name).toBe('Patagonia');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v2/insights?');
    expect(String(url)).toContain('filter.type=urn%3Aentity%3Abrand');
    expect(String(url)).toContain('signal.interests.entities=AAA');
    expect(String(url)).not.toContain('/recommendations');
    expect(String(url)).not.toContain('/recs');
    expect(init.method).toBe('GET');
  });

  it('treats GET /search 404 as empty results', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'No results',
    }) as unknown as typeof fetch;

    const client = new QlooClient({
      useMock: false,
      apiKey: 'test_key',
      baseUrl: 'https://hackathon.api.qloo.com',
    });
    const result = await client.searchEntities({ query: 'zzzz-unknown' });
    expect(result.entities).toEqual([]);
  });

  it('retries on 429 then succeeds', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => null },
        text: async () => 'rate limited',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: { tags: [{ name: 'wellness', tag_id: 'urn:tag:wellness' }] } }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new QlooClient({
      useMock: false,
      apiKey: 'test_key',
      baseUrl: 'https://hackathon.api.qloo.com',
    });
    const result = await client.getTags({ query: 'wellness' });
    expect(result.tags[0].tag).toBe('wellness');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('caches identical GET responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ results: [{ entity_id: '1', name: 'Nike', subtype: 'urn:entity:brand' }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new QlooClient({
      useMock: false,
      apiKey: 'test_key',
      baseUrl: 'https://hackathon.api.qloo.com',
      cacheTtlMs: 60_000,
    });
    await client.searchEntities({ query: 'Nike' });
    await client.searchEntities({ query: 'Nike' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws QlooApiError on 401', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => null },
      text: async () => 'No API key found in request',
    }) as unknown as typeof fetch;

    const client = new QlooClient({
      useMock: false,
      apiKey: 'bad',
      baseUrl: 'https://hackathon.api.qloo.com',
    });
    await expect(client.getInsights({ audience: { geography: 'US' } })).rejects.toBeInstanceOf(
      QlooApiError
    );
  });
});
