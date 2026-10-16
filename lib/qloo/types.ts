/**
 * Qloo API Types
 * Based on Qloo Insights API documentation
 */

export interface QlooEntity {
  id: string;
  name: string;
  type: 'brand' | 'place' | 'media' | 'artist' | 'person';
  category?: string;
  description?: string;
}

export interface QlooSearchResult {
  entities: QlooEntity[];
  total: number;
}

export interface QlooAffinity {
  entity: QlooEntity;
  score: number; // 0-100
  category: string;
  rank?: number;
}

export interface QlooInsightsResponse {
  affinities: QlooAffinity[];
  audience: {
    age_range?: string;
    gender?: string;
    geography?: string;
  };
  metadata: {
    total_results: number;
    confidence: number;
  };
}

export interface QlooTag {
  tag: string;
  score: number;
  category: string;
  trending?: boolean;
}

export interface QlooTagsResponse {
  tags: QlooTag[];
  entity_id?: string;
  metadata: {
    total_results: number;
  };
}

export interface QlooComparisonDifference {
  entity: QlooEntity;
  target_score: number;
  baseline_score: number;
  difference: number; // positive = overindexed in target
  category: string;
}

export interface QlooComparisonResponse {
  differences: QlooComparisonDifference[];
  target_audience: {
    age_range?: string;
    gender?: string;
    geography?: string;
  };
  baseline: string; // e.g., "general population"
  metadata: {
    total_results: number;
  };
}

// API Request Types
export interface SearchEntitiesRequest {
  query: string;
  types?: QlooEntity['type'][];
  limit?: number;
}

export interface GetInsightsRequest {
  audience?: {
    age_range?: string;
    gender?: string;
    geography?: string;
  };
  categories?: string[];
  limit?: number;
}

export interface GetTagsRequest {
  entity_ids?: string[];
  categories?: string[];
  limit?: number;
  trending_only?: boolean;
}

export interface CompareAudiencesRequest {
  target_audience: {
    age_range?: string;
    gender?: string;
    geography?: string;
  };
  baseline?: string; // defaults to "general population"
  categories?: string[];
  limit?: number;
}
