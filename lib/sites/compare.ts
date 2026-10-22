import type { Brief, Cell, Comparison, Site, SiteResult, Trace, Venue } from './schema';
import { sampleBrief, briefSchema } from './schema';
import { SiteError, record, rows, createReader, resolveReferences } from './qloo';
export { SiteError } from './qloo';

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
    const get = createReader(trace);
    references = await resolveReferences(brief, get);
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
