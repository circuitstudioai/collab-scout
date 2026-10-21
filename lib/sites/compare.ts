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
  if (!ranked.length) return 'No location can be shortlisted yet. Each location needs a rent within your budget and a nearby Qloo score. Check the rents and scores below.';
  if (ranked.length > 1 && ranked[0].cell!.affinity === ranked[1].cell!.affinity)
    return 'The leading locations within your rent budget have the same taste score. Compare lease terms and operating costs to decide which to visit first.';
  return `Start with ${ranked[0].name}. It has the highest nearby taste score among locations within your rent budget. Check lease terms and operating costs before deciding.`;
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
      throw new SiteError('The sample uses fixed New York locations. Choose Reset example to restore them, or use your own locations for a live comparison.');
    cells = [
      { latitude: 40.738, longitude: -74.003, affinity: 0.83 },
      { latitude: 40.7229, longitude: -73.988, affinity: 0.68 },
      { latitude: 40.7096, longitude: -73.961, affinity: 0.91 },
    ];
    references = [{ id: 'sample-reference', name: 'Blue Bottle Coffee (sample)' }];
    contexts = brief.sites.map((_, i) => ({ available: true, venues: [{ id: `sample-${i}`, name: 'Example café (made up for this sample)', affinity: null }] }));
    trace.push({ step: 'Load sample comparison', path: 'local fixture · no Qloo calls', params: {}, status: 'ok', count: cells.length });
  } else {
    const apiKey = resolveQlooApiKey();
    if (!apiKey) throw new SiteError('Live comparisons are not configured yet. Try the sample comparison for now.', 503);
    async function get(step: string, path: string, params: Record<string, string>, resultKey: string) {
      try {
        const raw = await qlooGet({ apiKey, baseUrl: resolveQlooBaseUrl(), path, params, timeoutMs: 8000, maxRetries: 0 });
        if (record(raw).success === false) throw new Error('Unsuccessful Qloo response');
        trace.push({ step, path, params, status: 'ok', count: rows(raw, resultKey).length });
        return raw;
      } catch {
        trace.push({ step, path, params, status: 'unavailable', count: 0 });
        throw new SiteError(`Qloo did not return the data for this step. Try again or use the sample comparison.`, 502);
      }
    }
    references = [];
    for (const name of brief.references) {
      const raw = await get(`Find ${name}`, '/search', { query: name, take: '10' }, 'entities');
      // Search has historically returned either results[] or results.entities[].
      const result = record(raw).results;
      const candidates = Array.isArray(result) ? result.map(record) : rows(raw, 'entities');
      const matches = candidates.filter(r => String(r.name).trim().toLowerCase() === name.trim().toLowerCase() && typeof r.entity_id === 'string' && r.entity_id.trim().length > 0);
      if (matches.length !== 1) throw new SiteError(`We could not find a single exact match for “${name}”. Check the name or choose another brand or place.`);
      references.push({ id: String(matches[0].entity_id).trim(), name: String(matches[0].name) });
    }
    const interests = references.map(r => r.id).join(',');
    const raw = await get('Get taste scores for the area', '/v2/insights', {
      'filter.type': 'urn:heatmap', 'filter.location.query': brief.city,
      'signal.interests.entities': interests, 'signal.interests.tags': 'urn:tag:genre:place:restaurant',
    }, 'heatmap');
    cells = parseCells(raw);
    if (!cells.length) throw new SiteError('Qloo returned no map scores for this area. Try another city or a different brand or place.');
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
      'Confirm the rent, extra charges, lease terms, and permission to operate a restaurant.',
      'Visit during your planned opening hours and count passersby. Check whether they are likely customers.',
      'Check kitchen equipment, permits, renovation costs, and the sales needed to cover your costs.',
    ] };
}
