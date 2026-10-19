import { mapAgeRange, mapGender, popularityToScore, urnToAppType } from '../lib/qloo/map';
import { extractSearchTerms } from '../lib/agent/gather';
import { cannedTasteBrief } from '../lib/agent/canned';
import { shouldUseQlooMock } from '../lib/qloo/config';

describe('Qloo parameter mapping', () => {
  it('maps age ranges onto documented demographic buckets', () => {
    expect(mapAgeRange('25-40')).toContain('25_to_29');
    expect(mapAgeRange('25-40')).toContain('35_to_44');
    expect(mapAgeRange('18-24')).toBe('24_and_younger');
  });

  it('maps gender only when male/female', () => {
    expect(mapGender('female')).toBe('female');
    expect(mapGender('all')).toBeUndefined();
  });

  it('maps URNs to app types', () => {
    expect(urnToAppType('urn:entity:brand')).toBe('brand');
    expect(urnToAppType('urn:entity:place')).toBe('place');
    expect(urnToAppType('urn:entity:movie')).toBe('media');
  });

  it('converts 0-1 popularity to a 0-100 score', () => {
    expect(popularityToScore(0.82)).toBe(82);
    expect(popularityToScore(87)).toBe(87);
  });
});

describe('gather helpers', () => {
  it('extracts competitor names as search terms', () => {
    const terms = extractSearchTerms({
      title: 'Sustainable Activewear Brand Launch',
      description: 'test',
      product_concept: 'Premium apparel next to Lululemon quality',
      target_geography: 'United States',
      competitor_brands: ['Patagonia', 'Allbirds'],
    });
    expect(terms).toEqual(expect.arrayContaining(['Patagonia', 'Allbirds']));
  });
});

describe('canned fallback', () => {
  it('builds a complete taste brief from Qloo signals without Gemini', () => {
    const brief = cannedTasteBrief(
      'brief_001',
      {
        id: 'brief_001',
        title: 'Sustainable Activewear Brand Launch',
        description: 'Launch',
        product_concept: 'Recycled ocean plastic activewear',
        target_geography: 'United States',
        target_audience: { age_range: '25-40' },
        competitor_brands: ['Lululemon'],
      },
      {
        entities: [{ id: 'E1', name: 'Lululemon', type: 'brand', category: 'urn:entity:brand' }],
        brandAffinities: [
          { name: 'Patagonia', score: 87, category: 'brand', source: 'E2' },
        ],
        placeAffinities: [
          { name: 'Whole Foods Market', score: 80, category: 'place', source: 'E3' },
        ],
        tags: [{ tag: 'sustainability', score: 91, category: 'Values', id: 'urn:tag:sustainability' }],
        differences: [],
        sources: ['GET /search', 'GET /v2/insights (filter.type=urn:entity:brand)'],
        confidence: 0.86,
        mocked: true,
      }
    );

    expect(brief.suggested_questions.length).toBeGreaterThanOrEqual(6);
    expect(brief.brand_affinities[0].source).toBe('E2');
    expect(brief.metadata.data_sources.join(' ')).toContain('/v2/insights');
  });
});

describe('mock flag', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('uses mock when QLOO_USE_MOCK=true even if a key exists', () => {
    process.env.QLOO_USE_MOCK = 'true';
    process.env.QLOO_API_KEY = 'present';
    expect(shouldUseQlooMock()).toBe(true);
  });

  it('uses mock when the key is missing', () => {
    delete process.env.QLOO_API_KEY;
    delete process.env.QLOO_USE_MOCK;
    delete process.env.USE_QLOO_MOCK;
    expect(shouldUseQlooMock()).toBe(true);
  });

  it('uses live when a key is present and mock is not forced', () => {
    process.env.QLOO_API_KEY = 'present';
    delete process.env.QLOO_USE_MOCK;
    delete process.env.USE_QLOO_MOCK;
    expect(shouldUseQlooMock()).toBe(false);
  });
});
