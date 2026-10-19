import {
  categoriesOverlap,
  classifyCandidate,
  filterAndRank,
  filterCompetitors,
  rankByAffinity,
  type PartnerCandidate,
} from '../lib/agent/rank';

const coffeeFounder = {
  founderCategory: 'specialty coffee',
  seedNames: ['Northline Provisions', 'Blue Bottle'],
  seedIds: ['brand_bluebottle_001'],
  excludeNames: ['Starbucks'],
};

function cand(
  partial: Partial<PartnerCandidate> & Pick<PartnerCandidate, 'name' | 'category'>
): PartnerCandidate {
  return {
    id: partial.id || partial.name,
    type: partial.type || 'brand',
    score: partial.score ?? 80,
    ...partial,
  };
}

describe('categoriesOverlap', () => {
  it('treats coffee shop as the same category as specialty coffee', () => {
    expect(categoriesOverlap('Coffee Shop', 'specialty coffee')).toBe(true);
  });

  it('does not treat athletic apparel as coffee', () => {
    expect(categoriesOverlap('Athletic Apparel', 'specialty coffee')).toBe(false);
  });
});

describe('competitor filtering', () => {
  const pool: PartnerCandidate[] = [
    cand({ id: 'brand_bluebottle_001', name: 'Blue Bottle', category: 'Coffee', score: 84 }),
    cand({ id: 'brand_starbucks_001', name: 'Starbucks', category: 'Coffee Shop', score: 70 }),
    cand({ id: 'brand_patagonia_001', name: 'Patagonia', category: 'Outdoor Apparel', score: 87 }),
    cand({ id: 'brand_lululemon_001', name: 'Lululemon', category: 'Athletic Apparel', score: 85 }),
    cand({
      id: 'place_acehotel_001',
      name: 'Ace Hotel',
      category: 'Hotel',
      type: 'place',
      score: 75,
    }),
  ];

  it('drops seeds, exclusions, and same-category brands', () => {
    const { kept, dropped } = filterCompetitors(pool, coffeeFounder);
    const names = kept.map((k) => k.name);
    expect(names).toEqual(expect.arrayContaining(['Patagonia', 'Lululemon', 'Ace Hotel']));
    expect(names).not.toContain('Blue Bottle');
    expect(names).not.toContain('Starbucks');
    expect(dropped.map((d) => d.candidate.name)).toEqual(
      expect.arrayContaining(['Blue Bottle', 'Starbucks'])
    );
  });

  it('keeps places even if the founder category string is unrelated', () => {
    const decision = classifyCandidate(
      cand({ name: 'Ace Hotel', category: 'Hotel', type: 'place', score: 75 }),
      coffeeFounder
    );
    expect(decision.keep).toBe(true);
  });

  it('drops a fragrance brand against a home fragrance founder', () => {
    const decision = classifyCandidate(cand({ name: 'Le Labo', category: 'Fragrance', score: 80 }), {
      founderCategory: 'home fragrance',
      seedNames: ['Harbor & Pine'],
      seedIds: [],
      excludeNames: ['Glade'],
    });
    expect(decision.keep).toBe(false);
    expect(decision.reason).toMatch(/same category/i);
  });
});

describe('ranking', () => {
  it('sorts by affinity descending, then name', () => {
    const ranked = rankByAffinity([
      cand({ name: 'Zebra', category: 'Outdoor Apparel', score: 70 }),
      cand({ name: 'Patagonia', category: 'Outdoor Apparel', score: 87 }),
      cand({ name: 'Lululemon', category: 'Athletic Apparel', score: 87 }),
    ]);
    expect(ranked.map((r) => r.name)).toEqual(['Lululemon', 'Patagonia', 'Zebra']);
  });

  it('filterAndRank returns complementary partners highest-first', () => {
    const { ranked } = filterAndRank(
      [
        cand({ name: 'Starbucks', category: 'Coffee', score: 99 }),
        cand({ name: 'Patagonia', category: 'Outdoor Apparel', score: 87 }),
        cand({ name: 'Glossier', category: 'Beauty', score: 77 }),
      ],
      coffeeFounder
    );
    expect(ranked.map((r) => r.name)).toEqual(['Patagonia', 'Glossier']);
  });
});
