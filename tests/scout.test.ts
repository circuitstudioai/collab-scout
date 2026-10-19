import { resetQlooClient } from '../lib/qloo/client';
import { scoutPartners } from '../lib/agent/orchestrator';

describe('scoutPartners (mock Qloo)', () => {
  beforeEach(() => {
    process.env.QLOO_USE_MOCK = 'true';
    delete process.env.GEMINI_API_KEY;
    resetQlooClient();
  });

  it('returns a complementary shortlist and a Qloo trace', async () => {
    const result = await scoutPartners({
      id: 'northline',
      brand_name: 'Northline Provisions',
      category: 'specialty coffee',
      seed_brands: ['Blue Bottle', 'Stumptown'],
      target_geography: 'United States',
      audience_age: '25-34',
      exclude_brands: ['Starbucks'],
    });

    expect(result.qloo_trace.some((t) => t.path === '/search')).toBe(true);
    expect(result.qloo_trace.some((t) => t.path === '/v2/insights')).toBe(true);
    expect(result.partners.length).toBeGreaterThan(0);
    expect(result.partners.some((p) => /coffee/i.test(p.category))).toBe(false);
    expect(result.partners.some((p) => p.name === 'Starbucks')).toBe(false);
    expect(result.partners.every((p) => p.outreach_draft.includes('DRAFT'))).toBe(true);
    expect(result.metadata.disclaimer).toMatch(/never sends email/i);
    expect(result.partners[0].affinity_score).toBeGreaterThanOrEqual(
      result.partners[result.partners.length - 1].affinity_score
    );
  }, 20_000);
});
