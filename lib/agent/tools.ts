/**
 * Qloo tools used by the taste agent.
 * Each tool maps to a documented hackathon endpoint (GET + X-Api-Key).
 */

import { z } from 'zod';
import { getQlooClient } from '../qloo/client';
import type { QlooEntityType } from '../qloo/types';

export const searchEntitiesSchema = z.object({
  query: z.string().describe('Brand, place, or media name'),
  types: z.array(z.enum(['brand', 'place', 'media', 'artist', 'person'])).optional(),
  limit: z.number().optional().default(10),
});

export const getInsightsSchema = z.object({
  audience: z
    .object({
      age_range: z.string().optional(),
      gender: z.string().optional(),
      geography: z.string().optional(),
    })
    .optional(),
  entity_ids: z.array(z.string()).optional(),
  filter_type: z.string().optional(),
  categories: z.array(z.string()).optional(),
  limit: z.number().optional().default(20),
});

export const getTagsSchema = z.object({
  query: z.string().optional(),
  entity_ids: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  trending_only: z.boolean().optional().default(false),
  limit: z.number().optional().default(15),
});

export const compareAudiencesSchema = z.object({
  target_audience: z.object({
    age_range: z.string().optional(),
    gender: z.string().optional(),
    geography: z.string().optional(),
  }),
  entity_ids: z.array(z.string()).optional(),
  baseline_entity_ids: z.array(z.string()).optional(),
  baseline: z.string().optional().default('general population'),
  categories: z.array(z.string()).optional(),
  limit: z.number().optional().default(20),
});

export async function searchEntitiesTool(args: z.infer<typeof searchEntitiesSchema>) {
  const client = getQlooClient();
  const result = await client.searchEntities({
    query: args.query,
    types: args.types as QlooEntityType[] | undefined,
    limit: args.limit,
  });
  return {
    entities: result.entities.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      category: e.category,
    })),
    total: result.total,
  };
}

export async function getInsightsTool(args: z.infer<typeof getInsightsSchema>) {
  const client = getQlooClient();
  const result = await client.getInsights(args);
  return {
    affinities: result.affinities.map((a) => ({
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
}

export async function getTagsTool(args: z.infer<typeof getTagsSchema>) {
  const client = getQlooClient();
  const result = await client.getTags(args);
  return {
    tags: result.tags.map((t) => ({
      tag: t.tag,
      score: t.score,
      category: t.category,
      trending: t.trending,
      id: t.id,
    })),
    entity_id: result.entity_id,
  };
}

export async function compareAudiencesTool(args: z.infer<typeof compareAudiencesSchema>) {
  const client = getQlooClient();
  const result = await client.compareAudiences(args);
  return {
    differences: result.differences.map((d) => ({
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
}

export const qlooTools = {
  search_entities: searchEntitiesTool,
  get_insights: getInsightsTool,
  get_tags: getTagsTool,
  compare_audiences: compareAudiencesTool,
};
