/**
 * Mock Qloo API responses for development and testing
 */

import type {
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

// Mock entity database
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
      id: 'place_starbucks_001',
      name: 'Starbucks',
      type: 'place',
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
  'sweetgreen': [
    {
      id: 'place_sweetgreen_001',
      name: 'Sweetgreen',
      type: 'place',
      category: 'Restaurant',
      description: 'Fast-casual salad restaurant chain',
    },
  ],
  'glossier': [
    {
      id: 'brand_glossier_001',
      name: 'Glossier',
      type: 'brand',
      category: 'Beauty',
      description: 'Direct-to-consumer beauty brand',
    },
  ],
};

export class MockQlooClient {
  async searchEntities(request: SearchEntitiesRequest): Promise<QlooSearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const query = request.query.toLowerCase();
    const results: QlooEntity[] = [];

    // Search through mock entities
    for (const [key, entities] of Object.entries(MOCK_ENTITIES)) {
      if (key.includes(query) || entities.some(e => e.name.toLowerCase().includes(query))) {
        results.push(...entities);
      }
    }

    // Filter by type if specified
    const filtered = request.types
      ? results.filter(e => request.types!.includes(e.type))
      : results;

    const limited = filtered.slice(0, request.limit || 10);

    return {
      entities: limited,
      total: limited.length,
    };
  }

  async getInsights(request: GetInsightsRequest): Promise<QlooInsightsResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock affinities based on audience
    const mockAffinities = [
      {
        entity: {
          id: 'brand_patagonia_001',
          name: 'Patagonia',
          type: 'brand' as const,
          category: 'Outdoor Apparel',
        },
        score: 87,
        category: 'Brands',
        rank: 1,
      },
      {
        entity: {
          id: 'brand_lululemon_001',
          name: 'Lululemon',
          type: 'brand' as const,
          category: 'Athletic Apparel',
        },
        score: 85,
        category: 'Brands',
        rank: 2,
      },
      {
        entity: {
          id: 'place_wholefoods_001',
          name: 'Whole Foods Market',
          type: 'place' as const,
          category: 'Grocery',
        },
        score: 82,
        category: 'Places',
        rank: 3,
      },
      {
        entity: {
          id: 'brand_allbirds_001',
          name: 'Allbirds',
          type: 'brand' as const,
          category: 'Footwear',
        },
        score: 79,
        category: 'Brands',
        rank: 4,
      },
      {
        entity: {
          id: 'place_traderjoes_001',
          name: "Trader Joe's",
          type: 'place' as const,
          category: 'Grocery',
        },
        score: 76,
        category: 'Places',
        rank: 5,
      },
      {
        entity: {
          id: 'brand_bombas_001',
          name: 'Bombas',
          type: 'brand' as const,
          category: 'Apparel',
        },
        score: 74,
        category: 'Brands',
        rank: 6,
      },
    ];

    return {
      affinities: mockAffinities.slice(0, request.limit || 20),
      audience: request.audience || {},
      metadata: {
        total_results: mockAffinities.length,
        confidence: 0.92,
      },
    };
  }

  async getTags(request: GetTagsRequest): Promise<QlooTagsResponse> {
    await new Promise(resolve => setTimeout(resolve, 250));

    const mockTags = [
      { tag: 'sustainability', score: 91, category: 'Values', trending: true },
      { tag: 'wellness', score: 88, category: 'Lifestyle', trending: true },
      { tag: 'minimalism', score: 85, category: 'Aesthetic', trending: false },
      { tag: 'conscious consumer', score: 82, category: 'Identity', trending: true },
      { tag: 'eco-friendly', score: 80, category: 'Values', trending: false },
      { tag: 'premium quality', score: 78, category: 'Product', trending: false },
      { tag: 'mindfulness', score: 76, category: 'Lifestyle', trending: true },
      { tag: 'transparency', score: 74, category: 'Values', trending: false },
      { tag: 'community-driven', score: 72, category: 'Social', trending: false },
      { tag: 'innovation', score: 70, category: 'Technology', trending: false },
    ];

    return {
      tags: mockTags
        .filter(t => !request.trending_only || t.trending)
        .slice(0, request.limit || 15),
      entity_id: request.entity_ids?.[0],
      metadata: {
        total_results: mockTags.length,
      },
    };
  }

  async compareAudiences(request: CompareAudiencesRequest): Promise<QlooComparisonResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockDifferences = [
      {
        entity: {
          id: 'brand_patagonia_001',
          name: 'Patagonia',
          type: 'brand' as const,
          category: 'Outdoor Apparel',
        },
        target_score: 87,
        baseline_score: 52,
        difference: 35,
        category: 'Brands',
      },
      {
        entity: {
          id: 'brand_lululemon_001',
          name: 'Lululemon',
          type: 'brand' as const,
          category: 'Athletic Apparel',
        },
        target_score: 85,
        baseline_score: 48,
        difference: 37,
        category: 'Brands',
      },
      {
        entity: {
          id: 'place_wholefoods_001',
          name: 'Whole Foods Market',
          type: 'place' as const,
          category: 'Grocery',
        },
        target_score: 82,
        baseline_score: 55,
        difference: 27,
        category: 'Places',
      },
      {
        entity: {
          id: 'media_nytimes_001',
          name: 'The New York Times',
          type: 'media' as const,
          category: 'News',
        },
        target_score: 78,
        baseline_score: 45,
        difference: 33,
        category: 'Media',
      },
      {
        entity: {
          id: 'brand_teslamotors_001',
          name: 'Tesla',
          type: 'brand' as const,
          category: 'Automotive',
        },
        target_score: 76,
        baseline_score: 58,
        difference: 18,
        category: 'Brands',
      },
    ];

    return {
      differences: mockDifferences.slice(0, request.limit || 20),
      target_audience: request.target_audience,
      baseline: request.baseline || 'general population',
      metadata: {
        total_results: mockDifferences.length,
      },
    };
  }
}
