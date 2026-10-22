import { z } from 'zod';

export const siteSchema = z.object({
  id: z.string().min(1).max(30), name: z.string().trim().min(1).max(100),
  latitude: z.number().min(-85).max(85), longitude: z.number().min(-180).max(180),
  rent: z.number().min(0).max(1000000).nullable(),
});
export const briefSchema = z.object({
  concept: z.string().trim().min(3).max(300), city: z.string().trim().min(2).max(100),
  references: z.array(z.string().trim().min(2).max(100)).min(1).max(3),
  referenceSelections: z.array(z.object({ query: z.string().trim().min(2).max(100), id: z.string().trim().min(1).max(100) })).max(3).optional(),
  monthlyBudget: z.number().positive().max(1000000),
  sites: z.array(siteSchema).min(2).max(3), mode: z.enum(['sample', 'live']),
}).superRefine((value, ctx) => {
  if (new Set(value.sites.map(s => s.id)).size !== value.sites.length)
    ctx.addIssue({ code: 'custom', message: 'Each site needs a unique ID.', path: ['sites'] });
});
export type ReferenceChoice = { query: string; options: { id: string; name: string; type: string; address: string; closed: boolean }[] };
export type Brief = z.infer<typeof briefSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Cell = { latitude: number; longitude: number; affinity: number; popularity?:number; affinityRank?:number; audiencePercentile?:number; popularityPercentile?:number; contrast?:number };
export type Trace = { step: string; path: string; params: Record<string, string>; status: 'ok' | 'unavailable'; count: number };
export type Venue = { id: string; name: string; affinity: number | null; address?:string };
export type SiteResult = Site & { cell: Cell | null; distance: number | null; venues: Venue[]; contextAvailable: boolean; budget: 'within' | 'over' | 'unknown' };
export type Comparison = { mode: 'sample' | 'live'; createdAt: string; brief: Brief; references: { id: string; name: string }[]; cells: Cell[]; sites: SiteResult[]; trace: Trace[]; recommendation: string; nextSteps: string[] };

export const sampleBrief: Brief = {
  concept: 'An all-day specialty coffee bar with light meals', city: 'New York City',
  references: ['Blue Bottle Coffee'], monthlyBudget: 8000, mode: 'sample',
  sites: [
    { id: 'a', name: 'A · West Village', latitude: 40.7336, longitude: -74.003, rent: 7600 },
    { id: 'b', name: 'B · Lower East Side', latitude: 40.7185, longitude: -73.988, rent: 6200 },
    { id: 'c', name: 'C · Williamsburg', latitude: 40.714, longitude: -73.961, rent: 9400 },
  ],
};
