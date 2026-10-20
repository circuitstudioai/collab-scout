import { mapAgeRange, mapGender, popularityToScore, urnToAppType } from '../lib/qloo/map';
import { searchTermsFor } from '../lib/agent/gather';
import { cannedPartnerShortlist } from '../lib/agent/canned';
import { shouldUseQlooMock } from '../lib/qloo/config';
import type { ScoutSignals } from '../lib/agent/gather';

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

describe('scout search terms', () => {
  it('uses the founder name plus seed brands', () => {
    const terms = searchTermsFor({
      brand_name: 'Northline Provisions',
      category: 'specialty coffee',
      seed_brands: ['Blue Bottle', 'Stumptown'],
      target_geography: 'United States',
    });
    expect(terms).toEqual(['Northline Provisions', 'Blue Bottle', 'Stumptown']);
  });
});

describe('canned partner shortlist', () => {
  it('filters coffee competitors and drafts pitches without Gemini', () => {
    const signals: ScoutSignals = {
      seedEntities: [{ id: 'brand_bluebottle_001', name: 'Blue Bottle', type: 'brand', category: 'Coffee' }],
      brandAffinities: [
        {
          entity: { id: 'brand_bluebottle_001', name: 'Blue Bottle', type: 'brand', category: 'Coffee' },
          score: 84,
          category: 'Coffee',
        },
        {
          entity: { id: 'brand_starbucks_001', name: 'Starbucks', type: 'brand', category: 'Coffee Shop' },
          score: 70,
          category: 'Coffee',
        },
        {
          entity: { id: 'brand_patagonia_001', name: 'Patagonia', type: 'brand', category: 'Outdoor Apparel' },
          score: 87,
          category: 'Outdoor Apparel',
        },
      ],
      placeAffinities: [],
      artistAffinities: [],
      tags: [{ tag: 'craft', score: 83, category: 'Product', id: 'urn:tag:craft' }],
      compareNotes: ['Patagonia: target 87 vs baseline 52 (brand_patagonia_001)'],
      traces: [
        {
          id: 'qloo_1',
          at: new Date().toISOString(),
          method: 'GET',
          path: '/search',
          params: { query: 'Blue Bottle' },
          summary: 'Resolved Blue Bottle',
          mocked: true,
        },
      ],
      mocked: true,
    };

    const shortlist = cannedPartnerShortlist(
      'run_test',
      {
        brand_name: 'Northline Provisions',
        category: 'specialty coffee',
        seed_brands: ['Blue Bottle'],
        exclude_brands: ['Starbucks'],
        target_geography: 'United States',
      },
      signals
    );

    const names = shortlist.partners.map((p) => p.name);
    expect(names).toContain('Patagonia');
    expect(names).not.toContain('Blue Bottle');
    expect(names).not.toContain('Starbucks');
    expect(shortlist.partners[0].outreach_draft).toMatch(/DRAFT/);
    expect(shortlist.qloo_trace[0].path).toBe('/search');
    expect(shortlist.metadata.disclaimer).toMatch(/never sends email/i);
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
