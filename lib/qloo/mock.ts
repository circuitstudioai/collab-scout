/**
 * FALLBACK mock Qloo responses.
 * Used only when QLOO_API_KEY is missing or QLOO_USE_MOCK=true.
 */

import type {
  QlooAffinity,
  QlooEntity,
  QlooSearchResult,
  QlooInsightsResponse,
  QlooTagsResponse,
  QlooComparisonResponse,
  SearchEntitiesRequest,
  GetInsightsRequest,
  GetTagsRequest,
  CompareAudiencesRequest,
} from './types';

const MOCK_ENTITIES: Record<string, QlooEntity[]> = {
  lululemon: [
    {
      id: 'brand_lululemon_001',
      name: 'Lululemon',
      type: 'brand',
      category: 'Athletic Apparel',
      description: 'Premium athletic and lifestyle apparel',
    },
  ],
  nike: [
    {
      id: 'brand_nike_001',
      name: 'Nike',
      type: 'brand',
      category: 'Athletic Apparel',
      description: 'Global athletic footwear and apparel',
    },
  ],
  'whole foods': [
    {
      id: 'place_wholefoods_001',
      name: 'Whole Foods Market',
      type: 'place',
      category: 'Grocery',
      description: 'Natural and organic foods supermarket',
    },
  ],
  starbucks: [
    {
      id: 'brand_starbucks_001',
      name: 'Starbucks',
      type: 'brand',
      category: 'Coffee Shop',
      description: 'Global coffeehouse chain',
    },
  ],
  peloton: [
    {
      id: 'brand_peloton_001',
      name: 'Peloton',
      type: 'brand',
      category: 'Fitness Equipment',
      description: 'Connected fitness equipment and content',
    },
  ],
  sweetgreen: [
    {
      id: 'place_sweetgreen_001',
      name: 'Sweetgreen',
      type: 'place',
      category: 'Restaurant',
      description: 'Fast-casual salad restaurant chain',
    },
  ],
  glossier: [
    {
      id: 'brand_glossier_001',
      name: 'Glossier',
      type: 'brand',
      category: 'Beauty',
      description: 'Direct-to-consumer beauty brand',
    },
  ],
  'blue bottle': [
    {
      id: 'brand_bluebottle_001',
      name: 'Blue Bottle',
      type: 'brand',
      category: 'Coffee',
      description: 'Specialty coffee roaster',
    },
  ],
  stumptown: [
    {
      id: 'brand_stumptown_001',
      name: 'Stumptown',
      type: 'brand',
      category: 'Coffee',
      description: 'Portland specialty coffee',
    },
  ],
  aesop: [
    {
      id: 'brand_aesop_001',
      name: 'Aesop',
      type: 'brand',
      category: 'Beauty',
      description: 'Botanical skin care',
    },
  ],
  'le labo': [
    {
      id: 'brand_lelabo_001',
      name: 'Le Labo',
      type: 'brand',
      category: 'Fragrance',
      description: 'Artisanal perfume',
    },
  ],
  heath: [
    {
      id: 'brand_heath_001',
      name: 'Heath Ceramics',
      type: 'brand',
      category: 'Tableware',
      description: 'California stoneware',
    },
  ],
  'east fork': [
    {
      id: 'brand_eastfork_001',
      name: 'East Fork',
      type: 'brand',
      category: 'Ceramics',
      description: 'American-made pottery',
    },
  ],
  'crate & barrel': [
    {
      id: 'brand_crate_001',
      name: 'Crate & Barrel',
      type: 'brand',
      category: 'Home Goods',
      description: 'Home furnishings retailer',
    },
  ],
  glade: [
    {
      id: 'brand_glade_001',
      name: 'Glade',
      type: 'brand',
      category: 'Home Fragrance',
      description: 'Mass-market air care',
    },
  ],
};

const BRAND_AFFINITIES: QlooAffinity[] = [
  { entity: { id: 'brand_patagonia_001', name: 'Patagonia', type: 'brand', category: 'Outdoor Apparel' }, score: 87, category: 'Brands', rank: 1 },
  { entity: { id: 'brand_lululemon_001', name: 'Lululemon', type: 'brand', category: 'Athletic Apparel' }, score: 85, category: 'Brands', rank: 2 },
  { entity: { id: 'brand_bluebottle_001', name: 'Blue Bottle', type: 'brand', category: 'Coffee' }, score: 84, category: 'Brands', rank: 3 },
  { entity: { id: 'brand_aesop_001', name: 'Aesop', type: 'brand', category: 'Beauty' }, score: 81, category: 'Brands', rank: 4 },
  { entity: { id: 'brand_allbirds_001', name: 'Allbirds', type: 'brand', category: 'Footwear' }, score: 79, category: 'Brands', rank: 5 },
  { entity: { id: 'brand_glossier_001', name: 'Glossier', type: 'brand', category: 'Beauty' }, score: 77, category: 'Brands', rank: 6 },
  { entity: { id: 'brand_peloton_001', name: 'Peloton', type: 'brand', category: 'Fitness Equipment' }, score: 74, category: 'Brands', rank: 7 },
  { entity: { id: 'brand_bombas_001', name: 'Bombas', type: 'brand', category: 'Apparel' }, score: 72, category: 'Brands', rank: 8 },
  { entity: { id: 'brand_starbucks_001', name: 'Starbucks', type: 'brand', category: 'Coffee Shop' }, score: 70, category: 'Brands', rank: 9 },
  { entity: { id: 'brand_heath_001', name: 'Heath Ceramics', type: 'brand', category: 'Tableware' }, score: 68, category: 'Brands', rank: 10 },
];

const PLACE_AFFINITIES: QlooAffinity[] = [
  { entity: { id: 'place_wholefoods_001', name: 'Whole Foods Market', type: 'place', category: 'Grocery' }, score: 82, category: 'Places', rank: 1 },
  { entity: { id: 'place_sweetgreen_001', name: 'Sweetgreen', type: 'place', category: 'Restaurant' }, score: 78, category: 'Places', rank: 2 },
  { entity: { id: 'place_acehotel_001', name: 'Ace Hotel', type: 'place', category: 'Hotel' }, score: 75, category: 'Places', rank: 3 },
  { entity: { id: 'place_traderjoes_001', name: "Trader Joe's", type: 'place', category: 'Grocery' }, score: 73, category: 'Places', rank: 4 },
];

const ARTIST_AFFINITIES: QlooAffinity[] = [
  { entity: { id: 'artist_mitski_001', name: 'Mitski', type: 'artist', category: 'Artist' }, score: 71, category: 'Artists', rank: 1 },
  { entity: { id: 'artist_boniver_001', name: 'Bon Iver', type: 'artist', category: 'Artist' }, score: 69, category: 'Artists', rank: 2 },
];

export class MockQlooClient {
  async searchEntities(request: SearchEntitiesRequest): Promise<QlooSearchResult> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const query = request.query.toLowerCase();
    const results: QlooEntity[] = [];

    for (const [key, entities] of Object.entries(MOCK_ENTITIES)) {
      if (key.includes(query) || entities.some((e) => e.name.toLowerCase().includes(query))) {
        results.push(...entities);
      }
    }

    const filtered = request.types ? results.filter((e) => request.types!.includes(e.type)) : results;
    const limited = filtered.slice(0, request.limit || 10);
    return { entities: limited, total: limited.length };
  }

  async getInsights(request: GetInsightsRequest): Promise<QlooInsightsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const filter = (request.filter_type || request.categories?.[0] || 'brand').toLowerCase();
    let pool = BRAND_AFFINITIES;
    if (filter.includes('place')) pool = PLACE_AFFINITIES;
    else if (filter.includes('artist')) pool = ARTIST_AFFINITIES;
    else if (filter.includes('tag') || filter.includes('demographic')) pool = BRAND_AFFINITIES;

    const affinities = pool.slice(0, request.limit || 20);
    return {
      affinities,
      audience: request.audience || {},
      metadata: { total_results: affinities.length, confidence: 0.9 },
    };
  }

  async getTags(request: GetTagsRequest): Promise<QlooTagsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const mockTags = [
      { tag: 'sustainability', score: 91, category: 'Values', trending: true, id: 'urn:tag:sustainability' },
      { tag: 'wellness', score: 88, category: 'Lifestyle', trending: true, id: 'urn:tag:wellness' },
      { tag: 'minimalism', score: 85, category: 'Aesthetic', trending: false, id: 'urn:tag:minimalism' },
      { tag: 'craft', score: 83, category: 'Product', trending: true, id: 'urn:tag:craft' },
      { tag: 'conscious consumer', score: 82, category: 'Identity', trending: true, id: 'urn:tag:conscious' },
      { tag: 'design-forward', score: 79, category: 'Aesthetic', trending: false, id: 'urn:tag:design' },
      { tag: 'commuter ritual', score: 76, category: 'Lifestyle', trending: true, id: 'urn:tag:commuter' },
    ];
    return {
      tags: mockTags.filter((t) => !request.trending_only || t.trending).slice(0, request.limit || 15),
      entity_id: request.entity_ids?.[0],
      metadata: { total_results: mockTags.length },
    };
  }

  async compareAudiences(request: CompareAudiencesRequest): Promise<QlooComparisonResponse> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const mockDifferences = [
      {
        entity: { id: 'brand_patagonia_001', name: 'Patagonia', type: 'brand' as const, category: 'Outdoor Apparel' },
        target_score: 87,
        baseline_score: 52,
        difference: 35,
        category: 'Brands',
      },
      {
        entity: { id: 'brand_lululemon_001', name: 'Lululemon', type: 'brand' as const, category: 'Athletic Apparel' },
        target_score: 85,
        baseline_score: 48,
        difference: 37,
        category: 'Brands',
      },
    ];
    return {
      differences: mockDifferences.slice(0, request.limit || 20),
      target_audience: request.target_audience,
      baseline: request.baseline || 'general population',
      metadata: { total_results: mockDifferences.length },
    };
  }
}
