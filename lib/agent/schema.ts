import { z } from 'zod';

const partnerBriefFields = {
  id: z.string().optional(),
  brand_name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  seed_brands: z.array(z.string()).max(3).optional(),
  target_geography: z.string().min(1),
  audience_age: z.string().optional(),
  exclude_brands: z.array(z.string()).optional(),
};

export type PartnerBrief = {
  id?: string;
  brand_name: string;
  description?: string;
  category: string;
  seed_brands?: string[];
  target_geography: string;
  audience_age?: string;
  exclude_brands?: string[];
};

export function parsePartnerBrief(body: unknown) {
  return z.object(partnerBriefFields).safeParse(body);
}

export type OutreachStatus = 'none' | 'contacted' | 'replied' | 'declined';

export type CollabType =
  | 'co-branded drop'
  | 'bundle'
  | 'pop-up'
  | 'giveaway'
  | 'content swap';

export interface PartnerCard {
  id: string;
  name: string;
  type: 'brand' | 'place' | 'artist' | 'media' | 'person';
  category: string;
  affinity_score: number;
  why_it_fits: string;
  qloo_signal: {
    entity_id: string;
    score: number;
    shared_tags: string[];
    compare_note?: string;
  };
  collab_concept: {
    type: CollabType;
    title: string;
    description: string;
  };
  outreach_draft: string;
}

export interface QlooTraceEntry {
  id: string;
  at: string;
  method: 'GET';
  path: string;
  params: Record<string, string>;
  summary: string;
  mocked: boolean;
  cached?: boolean;
}

export interface PartnerShortlist {
  run_id: string;
  title: string;
  generated_at: string;
  summary: string;
  founder: PartnerBrief;
  partners: PartnerCard[];
  filtered_out: { name: string; reason: string }[];
  qloo_trace: QlooTraceEntry[];
  metadata: {
    qloo_mode: 'live' | 'fallback_mock';
    qloo_entities_resolved: number;
    synthesis: 'gemini-2.5-flash' | 'canned_fallback';
    disclaimer: string;
  };
}
