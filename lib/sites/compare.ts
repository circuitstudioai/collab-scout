import type { Brief, Cell, Comparison, Site, SiteResult, Trace, Venue } from './schema';
import { sampleBrief, briefSchema } from './schema';
import { qlooGet } from '../qloo/http';
import { resolveQlooApiKey, resolveQlooBaseUrl } from '../qloo/config';

export function distanceKm(a: Pick<Site, 'latitude' | 'longitude'>, b: Pick<Site, 'latitude' | 'longitude'>): number {
  const rad = Math.PI / 180;
  const dlat = (b.latitude - a.latitude) * rad, dlon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dlon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export function matchCell(site: Site, cells: Cell[]): { cell: Cell | null; distance: number | null } {
  const ordered = cells.map(cell => ({ cell, distance: distanceKm(site, cell) })).sort((a, b) => a.distance - b.distance);
  return ordered[0] && ordered[0].distance <= 2 ? ordered[0] : { cell: null, distance: null };
}
export function evaluateSites(brief: Brief, cells: Cell[], contexts: { venues: Venue[]; available: boolean }[]): SiteResult[] {
  return brief.sites.map((site, index) => ({ ...site, ...matchCell(site, cells),
    venues: contexts[index]?.venues ?? [], contextAvailable: contexts[index]?.available ?? false,
    budget: site.rent === null ? 'unknown' : site.rent <= brief.monthlyBudget ? 'within' : 'over',
  }));
}
export function recommend(sites: SiteResult[]): string {
  const ranked = sites.filter(s => s.budget === 'within' && s.cell).sort((a, b) => b.cell!.affinity - a.cell!.affinity);
  if (!ranked.length) return 'No supported shortlist yet. Supply an in-budget rent and a site within 2 km of a returned heatmap point.';
  if (ranked.length > 1 && ranked[0].cell!.affinity === ranked[1].cell!.affinity)
    return 'The leading in-budget sites share the same taste signal. Use site visits and verified operating costs to distinguish them.';
  return `${ranked[0].name} has the strongest nearby taste signal among sites within your stated rent budget. Investigate it first; this is not a lease recommendation.`;
}
export class SiteError extends Error { constructor(message: string, public status = 422) { super(message); } }
type Row = Record<string, unknown>;
const record = (value: unknown): Row => value && typeof value === 'object' ? value as Row : {};
function rows(raw: unknown, key: string): Row[] { const results = record(raw).results; const list = key === 'entities' && Array.isArray(results) ? results : record(results)[key]; return Array.isArray(list) ? list.map(record) : []; }
export function parseCells(raw: unknown): Cell[] {
  return rows(raw, 'heatmap').flatMap(row => {
    const p = record(row.location), q = record(row.query);
    return typeof p.latitude === 'number' && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 &&
      typeof p.longitude === 'number' && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180 &&
      typeof q.affinity === 'number' && Number.isFinite(q.affinity)
      ? [{ latitude: p.latitude, longitude: p.longitude, affinity: q.affinity }] : [];
  });
}
export async function compareSites(brief: Brief): Promise<Comparison> {
  const trace: Trace[] = [];
  let cells: Cell[], references: { id: string; name: string }[], contexts: { venues: Venue[]; available: boolean }[];
  if (brief.mode === 'sample') {
    // A fixed, disclosed fixture: never synthesize evidence for custom locations or concepts.
    if (JSON.stringify(brief) !== JSON.stringify(briefSchema.parse(sampleBrief)))
      throw new SiteError('Sample mode uses the unchanged New York example. Reset the example or choose live analysis.');
    cells = [
      { latitude: 40.7336, longitude: -74.003, affinity: 0.83 },
      { latitude: 40.7185, longitude: -73.988, affinity: 0.68 },
      { latitude: 40.714, longitude: -73.961, affinity: 0.91 },
    ];
    references = [{ id: 'sample-reference', name: 'Blue Bottle Coffee (sample reference)' }];
    contexts = brief.sites.map((_, i) => ({ available: true, venues: [{ id: `sample-${i}`, name: 'Illustrative nearby café (not a real business)', affinity: null }] }));
    trace.push({ step: 'Load disclosed sample fixture', path: 'local fixture · no Qloo calls', params: {}, status: 'ok', count: cells.length });
  } else {
    const apiKey = resolveQlooApiKey();
    if (!apiKey) throw new SiteError('Live analysis is not configured yet. The owner must add QLOO_API_KEY. Sample mode remains available.', 503);
    async function get(step: string, path: string, params: Record<string, string>, resultKey: string) {
      try {
        const raw = await qlooGet({ apiKey, baseUrl: resolveQlooBaseUrl(), path, params, timeoutMs: 8000, maxRetries: 0 });
        if (record(raw).success === false) throw new Error('Unsuccessful Qloo response');
        trace.push({ step, path, params, status: 'ok', count: rows(raw, resultKey).length });
        return raw;
      } catch {
        trace.push({ step, path, params, status: 'unavailable', count: 0 });
        throw new SiteError(`${step} could not be completed. No sample evidence was substituted. Try again or use the labelled example.`, 502);
      }
    }
    references = [];
    for (const name of brief.references) {
      const raw = await get(`Resolve reference: ${name}`, '/search', { query: name, take: '10' }, 'entities');
      // Search has historically returned either results[] or results.entities[].
      const result = record(raw).results;
      const candidates = Array.isArray(result) ? result.map(record) : rows(raw, 'entities');
      const matches = candidates.filter(r => String(r.name).trim().toLowerCase() === name.trim().toLowerCase() && typeof r.entity_id === 'string');
      if (matches.length !== 1) throw new SiteError(`“${name}” did not resolve uniquely. Use a more specific, exact Qloo entity name.`);
      references.push({ id: String(matches[0].entity_id), name: String(matches[0].name) });
    }
    const interests = references.map(r => r.id).join(',');
    const raw = await get('Map audience affinity', '/v2/insights', {
      'filter.type': 'urn:heatmap', 'filter.location.query': brief.city,
      'signal.interests.entities': interests, 'signal.interests.tags': 'urn:tag:genre:place:restaurant',
    }, 'heatmap');
    cells = parseCells(raw);
    if (!cells.length) throw new SiteError('Qloo returned no usable heatmap points for this brief. Try another locality or reference.');
    contexts = await Promise.all(brief.sites.map(async site => {
      try {
        const result = await get(`Nearby dining: ${site.name}`, '/v2/insights', {
          'filter.type': 'urn:entity:place', 'filter.location': `POINT(${site.longitude} ${site.latitude})`,
          'filter.location.radius': '1000', 'filter.tags': 'urn:tag:genre:place:restaurant',
          'signal.interests.entities': interests, take: '8',
        }, 'entities');
        const venues = rows(result, 'entities').filter(v => typeof v.entity_id === 'string' && typeof v.name === 'string').map(v => ({
          id: String(v.entity_id), name: String(v.name), affinity: typeof record(v.query).affinity === 'number' ? record(v.query).affinity as number : null,
        }));
        return { available: true, venues };
      } catch { return { available: false, venues: [] }; }
    }));
  }
  const sites = evaluateSites(brief, cells, contexts);
  return { mode: brief.mode, createdAt: new Date().toISOString(), brief, references, cells, sites, trace,
    recommendation: recommend(sites), nextSteps: [
      'Confirm the quoted rent, service charges, lease terms, and permitted restaurant use.',
      'Observe foot traffic at your intended trading hours. Taste affinity does not measure demand.',
      'Verify kitchen infrastructure, permits, build-out costs, and break-even sales before choosing a lease.',
    ] };
}
