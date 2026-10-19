/**
 * App-level Qloo types. Live responses are normalized in map.ts.
 */

export type QlooEntityType = 'brand' | 'place' | 'media' | 'artist' | 'person';

export interface QlooEntity {
  id: string;
  name: string;
  type: QlooEntityType;
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
  id?: string;
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
  baseline: string;
  metadata: {
    total_results: number;
  };
}

export interface SearchEntitiesRequest {
  query: string;
  types?: QlooEntityType[];
  limit?: number;
}

export interface GetInsightsRequest {
  audience?: {
    age_range?: string;
    gender?: string;
    geography?: string;
  };
  entity_ids?: string[];
  tag_ids?: string[];
  filter_type?: string;
  categories?: string[];
  limit?: number;
}

export interface GetTagsRequest {
  query?: string;
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
  entity_ids?: string[];
  baseline_entity_ids?: string[];
  baseline?: string;
  categories?: string[];
  limit?: number;
}
