/**
 * Agent input/output schemas
 */

import { z } from 'zod';

export const ResearchBriefSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  product_concept: z.string(),
  target_geography: z.string(),
  target_audience: z.object({
    age_range: z.string().optional(),
    gender: z.string().optional(),
  }).optional(),
  competitor_brands: z.array(z.string()).optional(),
  additional_context: z.string().optional(),
});

export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;

export const TasteBriefSchema = z.object({
  brief_id: z.string(),
  title: z.string(),
  generated_at: z.string(),
  
  // Core insights
  summary: z.string(),
  audience_profile: z.object({
    description: z.string(),
    key_characteristics: z.array(z.string()),
  }),
  
  // Qloo-sourced data
  brand_affinities: z.array(z.object({
    name: z.string(),
    score: z.number(),
    category: z.string(),
    source: z.string(), // Qloo entity ID
  })),
  
  place_affinities: z.array(z.object({
    name: z.string(),
    score: z.number(),
    category: z.string(),
    source: z.string(),
  })),
  
  trending_themes: z.array(z.object({
    tag: z.string(),
    score: z.number(),
    category: z.string(),
    relevance: z.string(),
  })),
  
  competitive_insights: z.array(z.object({
    competitor: z.string(),
    entity_id: z.string(),
    positioning: z.string(),
    audience_overlap: z.number(),
  })).optional(),
  
  audience_differentiators: z.array(z.object({
    dimension: z.string(),
    insight: z.string(),
    score: z.number(),
    source: z.string(),
  })),
  
  // Survey recommendations
  suggested_questions: z.array(z.object({
    question: z.string(),
    rationale: z.string(),
    question_type: z.enum(['multiple_choice', 'rating_scale', 'open_ended', 'ranking']),
    options: z.array(z.string()).optional(),
  })),
  
  // Positioning recommendations
  positioning_angles: z.array(z.object({
    angle: z.string(),
    description: z.string(),
    supporting_data: z.array(z.string()),
  })),
  
  // Metadata
  metadata: z.object({
    qloo_entities_analyzed: z.number(),
    confidence_score: z.number(),
    data_sources: z.array(z.string()),
  }),
});

export type TasteBrief = z.infer<typeof TasteBriefSchema>;
