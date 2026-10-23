import { mapAgeRange, mapGender, popularityToScore, urnToAppType } from '../lib/qloo/map';
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
