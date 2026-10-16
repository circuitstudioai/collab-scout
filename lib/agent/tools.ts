/**
 * Agent tools for Qloo integration
 */

import { z } from 'zod';
import { getQlooClient } from '../qloo/client';

type QlooEntityType = 'brand' | 'place' | 'media' | 'artist' | 'person';

// Search Entities Tool
const searchEntitiesSchema = z.object({
  query: z.string().describe('The search query - brand name, place name, etc.'),
  types: z.array(z.enum(['brand', 'place', 'media', 'artist', 'person'])).optional()
    .describe('Filter by entity types. Omit to search all types.'),
  limit: z.number().optional().default(10).describe('Maximum number of results'),
});

export const searchEntitiesToolDefinition = {
  description: `Search for brands, places, media, or artists in the Qloo database. Use this to resolve mentions in the research brief to Qloo entity IDs.
  
  Examples:
  - To find "Lululemon": query = "Lululemon", types = ["brand"]
  - To find "Whole Foods": query = "Whole Foods", types = ["place"]
  - To find any entity: query = "Nike", types = undefined (searches all)
  `,
  inputSchema: searchEntitiesSchema,
  execute: async (args: z.infer<typeof searchEntitiesSchema>) => {
    const client = getQlooClient();
    const result = await client.searchEntities(args);
    
    return {
      entities: result.entities.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        category: e.category,
      })),
      total: result.total,
    };
  },
};

// Get Insights Tool
const getInsightsSchema = z.object({
  audience: z.object({
    age_range: z.string().optional().describe('e.g., "18-24", "25-34", "35-44"'),
    gender: z.string().optional().describe('e.g., "male", "female", "all"'),
    geography: z.string().optional().describe('e.g., "United States", "California", "New York"'),
  }).optional().describe('Target audience demographics'),
  categories: z.array(z.string()).optional().describe('Filter by categories (e.g., ["Brands", "Places", "Media"])'),
  limit: z.number().optional().default(20).describe('Maximum number of affinities to return'),
});

export const getInsightsToolDefinition = {
  description: `Get audience insights - discover what brands, places, and media a target audience has affinity for. This reveals the cultural and taste profile of your target demographic.
  
  Use this to understand:
  - What brands the audience loves
  - Where they spend time
  - What media they consume
  - Overall taste preferences
  `,
  inputSchema: getInsightsSchema,
  execute: async (args: z.infer<typeof getInsightsSchema>) => {
    const client = getQlooClient();
    const result = await client.getInsights(args);
    
    return {
      affinities: result.affinities.map(a => ({
        entity_id: a.entity.id,
        entity_name: a.entity.name,
        entity_type: a.entity.type,
        category: a.category,
        score: a.score,
        rank: a.rank,
      })),
      audience: result.audience,
      confidence: result.metadata.confidence,
    };
  },
};

// Get Tags Tool
const getTagsSchema = z.object({
  entity_ids: z.array(z.string()).optional().describe('Qloo entity IDs to get tags for'),
  categories: z.array(z.string()).optional().describe('Filter by tag categories'),
  trending_only: z.boolean().optional().default(false).describe('Only return trending tags'),
  limit: z.number().optional().default(15).describe('Maximum number of tags'),
});

export const getTagsToolDefinition = {
  description: `Get trending tags and themes related to entities or audiences. Use this to understand cultural themes, values, and positioning opportunities.
  
  Examples:
  - Get trending lifestyle tags: trending_only = true
  - Get tags for specific entities: entity_ids = ["brand_lululemon_001"]
  - Get all relevant tags: trending_only = false
  `,
  inputSchema: getTagsSchema,
  execute: async (args: z.infer<typeof getTagsSchema>) => {
    const client = getQlooClient();
    const result = await client.getTags(args);
    
    return {
      tags: result.tags.map(t => ({
        tag: t.tag,
        score: t.score,
        category: t.category,
        trending: t.trending,
      })),
      entity_id: result.entity_id,
    };
  },
};

// Compare Audiences Tool
const compareAudiencesSchema = z.object({
  target_audience: z.object({
    age_range: z.string().optional(),
    gender: z.string().optional(),
    geography: z.string().optional(),
  }).describe('The target audience to analyze'),
  baseline: z.string().optional().default('general population')
    .describe('Baseline to compare against (default: "general population")'),
  categories: z.array(z.string()).optional().describe('Filter by categories'),
  limit: z.number().optional().default(20).describe('Maximum number of differences'),
});

export const compareAudiencesToolDefinition = {
  description: `Compare a target audience against a baseline (e.g., general population) to identify what makes them unique. This reveals overindexed affinities - what the target loves MORE than average.
  
  Use this to:
  - Identify distinctive preferences
  - Find positioning opportunities
  - Understand audience differentiation
  `,
  inputSchema: compareAudiencesSchema,
  execute: async (args: z.infer<typeof compareAudiencesSchema>) => {
    const client = getQlooClient();
    const result = await client.compareAudiences(args);
    
    return {
      differences: result.differences.map(d => ({
        entity_id: d.entity.id,
        entity_name: d.entity.name,
        entity_type: d.entity.type,
        category: d.category,
        target_score: d.target_score,
        baseline_score: d.baseline_score,
        difference: d.difference,
        overindex: d.difference > 0,
      })),
      target_audience: result.target_audience,
      baseline: result.baseline,
    };
  },
};

// Export all tools as a map
export const qlooTools = {
  search_entities: searchEntitiesToolDefinition,
  get_insights: getInsightsToolDefinition,
  get_tags: getTagsToolDefinition,
  compare_audiences: compareAudiencesToolDefinition,
};
