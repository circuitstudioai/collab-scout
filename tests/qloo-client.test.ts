/**
 * Tests for Qloo Client
 */

import { QlooClient } from '../lib/qloo/client';

describe('QlooClient', () => {
  let client: QlooClient;

  beforeEach(() => {
    client = new QlooClient({ useMock: true });
  });

  describe('searchEntities', () => {
    it('should search for entities by query', async () => {
      const result = await client.searchEntities({
        query: 'lululemon',
        types: ['brand'],
        limit: 5,
      });

      expect(result).toHaveProperty('entities');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.entities)).toBe(true);
      expect(result.entities.length).toBeGreaterThan(0);
      expect(result.entities[0]).toHaveProperty('id');
      expect(result.entities[0]).toHaveProperty('name');
      expect(result.entities[0]).toHaveProperty('type');
    });

    it('should return empty results for unknown queries', async () => {
      const result = await client.searchEntities({
        query: 'nonexistentbrand12345xyz',
        limit: 5,
      });

      expect(result.entities).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getInsights', () => {
    it('should return audience insights', async () => {
      const result = await client.getInsights({
        audience: {
          age_range: '25-40',
          geography: 'United States',
        },
        limit: 10,
      });

      expect(result).toHaveProperty('affinities');
      expect(result).toHaveProperty('audience');
      expect(result).toHaveProperty('metadata');
      expect(Array.isArray(result.affinities)).toBe(true);
      expect(result.affinities.length).toBeGreaterThan(0);
      
      const affinity = result.affinities[0];
      expect(affinity).toHaveProperty('entity');
      expect(affinity).toHaveProperty('score');
      expect(affinity.score).toBeGreaterThan(0);
      expect(affinity.score).toBeLessThanOrEqual(100);
    });
  });

  describe('getTags', () => {
    it('should return trending tags', async () => {
      const result = await client.getTags({
        trending_only: true,
        limit: 5,
      });

      expect(result).toHaveProperty('tags');
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags.length).toBeGreaterThan(0);
      
      const tag = result.tags[0];
      expect(tag).toHaveProperty('tag');
      expect(tag).toHaveProperty('score');
      expect(tag).toHaveProperty('category');
      expect(tag.trending).toBe(true);
    });

    it('should return all tags when trending_only is false', async () => {
      const result = await client.getTags({
        trending_only: false,
        limit: 10,
      });

      expect(result.tags.length).toBeGreaterThan(0);
    });
  });

  describe('compareAudiences', () => {
    it('should compare target audience against baseline', async () => {
      const result = await client.compareAudiences({
        target_audience: {
          age_range: '25-40',
          geography: 'United States',
        },
        baseline: 'general population',
        limit: 10,
      });

      expect(result).toHaveProperty('differences');
      expect(result).toHaveProperty('target_audience');
      expect(result).toHaveProperty('baseline');
      expect(Array.isArray(result.differences)).toBe(true);
      expect(result.differences.length).toBeGreaterThan(0);
      
      const diff = result.differences[0];
      expect(diff).toHaveProperty('entity');
      expect(diff).toHaveProperty('target_score');
      expect(diff).toHaveProperty('baseline_score');
      expect(diff).toHaveProperty('difference');
    });
  });

  describe('Mock mode detection', () => {
    it('should indicate when using mock mode', () => {
      expect(client.isMocked()).toBe(true);
    });

    it('should not be mocked when USE_QLOO_MOCK is false', () => {
      const liveClient = new QlooClient({ useMock: false, apiKey: 'test_key' });
      expect(liveClient.isMocked()).toBe(false);
    });
  });
});
