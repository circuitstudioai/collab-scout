/**
 * Qloo API Client
 * Supports both real API and mocked responses
 */

import type {
  QlooSearchResult,
  QlooInsightsResponse,
  QlooTagsResponse,
  QlooComparisonResponse,
  SearchEntitiesRequest,
  GetInsightsRequest,
  GetTagsRequest,
  CompareAudiencesRequest,
} from './types';
import { MockQlooClient } from './mock';

export class QlooClient {
  private apiKey: string;
  private baseUrl: string;
  private useMock: boolean;
  private mockClient?: MockQlooClient;

  constructor(options?: {
    apiKey?: string;
    baseUrl?: string;
    useMock?: boolean;
  }) {
    this.apiKey = options?.apiKey || process.env.QLOO_API_KEY || '';
    this.baseUrl = options?.baseUrl || process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com';
    this.useMock = options?.useMock ?? (process.env.USE_QLOO_MOCK === 'true');

    if (this.useMock) {
      this.mockClient = new MockQlooClient();
      console.log('[Qloo] Using mocked client');
    } else if (!this.apiKey) {
      console.warn('[Qloo] No API key provided, some features may not work');
    }
  }

  /**
   * Search for entities (brands, places, media, artists) by name or query
   */
  async searchEntities(request: SearchEntitiesRequest): Promise<QlooSearchResult> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.searchEntities(request);
    }

    const params = new URLSearchParams({
      q: request.query,
      limit: String(request.limit || 10),
    });

    if (request.types && request.types.length > 0) {
      params.append('types', request.types.join(','));
    }

    const response = await this.fetch(`/v1/search?${params}`);
    return response;
  }

  /**
   * Get audience insights - top affinities across categories
   */
  async getInsights(request: GetInsightsRequest): Promise<QlooInsightsResponse> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.getInsights(request);
    }

    const body: any = {
      limit: request.limit || 20,
    };

    if (request.audience) {
      body.audience = request.audience;
    }

    if (request.categories && request.categories.length > 0) {
      body.categories = request.categories;
    }

    const response = await this.fetch('/v1/insights', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response;
  }

  /**
   * Get tags and themes associated with entities or audiences
   */
  async getTags(request: GetTagsRequest): Promise<QlooTagsResponse> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.getTags(request);
    }

    const body: any = {
      limit: request.limit || 15,
    };

    if (request.entity_ids && request.entity_ids.length > 0) {
      body.entity_ids = request.entity_ids;
    }

    if (request.categories && request.categories.length > 0) {
      body.categories = request.categories;
    }

    if (request.trending_only !== undefined) {
      body.trending_only = request.trending_only;
    }

    const response = await this.fetch('/v1/tags', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response;
  }

  /**
   * Compare target audience against a baseline (e.g., general population)
   */
  async compareAudiences(request: CompareAudiencesRequest): Promise<QlooComparisonResponse> {
    if (this.useMock && this.mockClient) {
      return this.mockClient.compareAudiences(request);
    }

    const body: any = {
      target_audience: request.target_audience,
      baseline: request.baseline || 'general population',
      limit: request.limit || 20,
    };

    if (request.categories && request.categories.length > 0) {
      body.categories = request.categories;
    }

    const response = await this.fetch('/v1/compare', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response;
  }

  /**
   * Internal fetch wrapper with authentication
   */
  private async fetch(endpoint: string, options?: RequestInit): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...(options?.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qloo API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Check if client is using mock mode
   */
  isMocked(): boolean {
    return this.useMock;
  }
}

// Singleton instance
let qlooClientInstance: QlooClient | null = null;

export function getQlooClient(): QlooClient {
  if (!qlooClientInstance) {
    qlooClientInstance = new QlooClient();
  }
  return qlooClientInstance;
}
