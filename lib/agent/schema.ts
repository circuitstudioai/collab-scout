import { z } from 'zod';

export const PartnerBriefSchema = z.object({
  id: z.string().optional(),
  brand_name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  seed_brands: z.array(z.string()).max(3).optional(),
  target_geography: z.string().min(1),
  audience_age: z.string().optional(),
  exclude_brands: z.array(z.string()).optional(),
});

export type PartnerBrief = z.infer<typeof PartnerBriefSchema>;

export const OutreachStatusSchema = z.enum(['none', 'contacted', 'replied', 'declined']);
export type OutreachStatus = z.infer<typeof OutreachStatusSchema>;

export const CollabTypeSchema = z.enum([
  'co-branded drop',
  'bundle',
  'pop-up',
  'giveaway',
  'content swap',
]);
export type CollabType = z.infer<typeof CollabTypeSchema>;

export const PartnerCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['brand', 'place', 'artist', 'media', 'person']),
  category: z.string(),
  affinity_score: z.number(),
  why_it_fits: z.string(),
  qloo_signal: z.object({
    entity_id: z.string(),
    score: z.number(),
    shared_tags: z.array(z.string()),
    compare_note: z.string().optional(),
  }),
  collab_concept: z.object({
    type: CollabTypeSchema,
    title: z.string(),
    description: z.string(),
  }),
  outreach_draft: z.string(),
});

export type PartnerCard = z.infer<typeof PartnerCardSchema>;

export const QlooTraceEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  method: z.literal('GET'),
  path: z.string(),
  params: z.record(z.string(), z.string()),
  summary: z.string(),
  mocked: z.boolean(),
  cached: z.boolean().optional(),
});

export type QlooTraceEntry = z.infer<typeof QlooTraceEntrySchema>;

export const PartnerShortlistSchema = z.object({
  run_id: z.string(),
  title: z.string(),
  generated_at: z.string(),
  summary: z.string(),
  founder: PartnerBriefSchema,
  partners: z.array(PartnerCardSchema),
  filtered_out: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
    })
  ),
  qloo_trace: z.array(QlooTraceEntrySchema),
  metadata: z.object({
    qloo_mode: z.enum(['live', 'fallback_mock']),
    qloo_entities_resolved: z.number(),
    synthesis: z.enum(['gemini-2.5-flash', 'canned_fallback']),
    disclaimer: z.string(),
  }),
});

export type PartnerShortlist = z.infer<typeof PartnerShortlistSchema>;
