import { compareSites } from '../lib/sites/compare';
import { briefSchema, sampleBrief } from '../lib/sites/schema';

// Synthetic transport fixtures; field names follow Qloo's public response examples.
// These are not recorded live results and do not establish API compatibility.
const originalKey = process.env.QLOO_API_KEY;
const originalUrl = process.env.QLOO_API_URL;
let network: jest.SpyInstance;
beforeEach(() => {
  process.env.QLOO_API_KEY = 'offline-contract-test-key';
  process.env.QLOO_API_URL = 'https://hackathon.api.qloo.com';
  network = jest.spyOn(globalThis, 'fetch');
});
afterEach(() => {
  jest.restoreAllMocks();
  if (originalKey === undefined) delete process.env.QLOO_API_KEY; else process.env.QLOO_API_KEY = originalKey;
  if (originalUrl === undefined) delete process.env.QLOO_API_URL; else process.env.QLOO_API_URL = originalUrl;
});
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }
function liveBrief() { return briefSchema.parse({ ...sampleBrief, mode: 'live' }); }
function heatmap() {
  return { success: true, results: { heatmap: sampleBrief.sites.map((s, i) => ({ location: { latitude: s.latitude, longitude: s.longitude }, query: { affinity: [.83, .68, .91][i] } })) } };
}

it('stops instead of silently running a generic query when a matched reference has an empty ID', async () => {
  network.mockImplementation(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname === '/search') return json({ success: true, results: [{ entity_id: '', name: 'Blue Bottle Coffee' }] });
    return url.searchParams.get('filter.type') === 'urn:heatmap' ? json(heatmap()) : json({ results: { entities: [] } });
  });
  await expect(compareSites(liveBrief())).rejects.toMatchObject({ status: 422 });
});

it.each(['array', 'nested'] as const)('runs the full offline pipeline for a %s search response using header-only auth and unchanged raw scores', async shape => {
  const reference = { entity_id: '00000000-0000-4000-8000-000000000001', name: 'Blue Bottle Coffee' };
  network.mockImplementation(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname === '/search') return json({ success: true, results: shape === 'array' ? [reference] : { entities: [reference] } });
    if (url.searchParams.get('filter.type') === 'urn:heatmap') return json(heatmap());
    return json({ success: true, results: { entities: [{ entity_id: '00000000-0000-4000-8000-000000000002', name: 'Synthetic fixture restaurant', query: { affinity: .7123 } }] } });
  });
  const result = await compareSites(liveBrief());
  expect(result.mode).toBe('live');
  expect(result.sites.map(s => s.cell?.affinity)).toEqual([.83, .68, .91]);
  expect(result.sites[2].budget).toBe('over');
  expect(result.recommendation).toContain('Start with A · West Village');
  expect(result.sites[0].venues[0].affinity).toBe(.7123);
  const calls = network.mock.calls as [string, RequestInit][];
  for (const [input, init] of calls) {
    const url = new URL(input);
    const headers = new Headers(init.headers);
    expect(url.origin).toBe('https://hackathon.api.qloo.com');
    expect(headers.get('X-Api-Key')).toBe('offline-contract-test-key');
    expect(headers.has('Authorization')).toBe(false);
    expect([...url.searchParams.values()]).not.toContain('offline-contract-test-key');
    expect(init.method).toBe('GET');
  }
  const maps = calls.map(([u]) => new URL(u)).filter(u => u.searchParams.get('filter.type') === 'urn:heatmap');
  expect(maps).toHaveLength(1);
  expect(maps[0].searchParams.get('signal.interests.entities')).toBe(reference.entity_id);
  const firstDining = calls.map(([u]) => new URL(u)).find(u => u.searchParams.get('filter.type') === 'urn:entity:place')!;
  expect(firstDining.searchParams.get('filter.location')).toBe('POINT(-74.003 40.7336)');
  expect(firstDining.searchParams.get('filter.location.radius')).toBe('1000');
});

it('stops at an HTTP 401 without retrying with fixtures or sending more provider calls', async () => {
  network.mockResolvedValue(json({ error: { reason: 'API keys mismatch' } }, 401));
  await expect(compareSites(liveBrief())).rejects.toMatchObject({ status: 502 });
  expect(network).toHaveBeenCalledTimes(1);
});

it('rejects a successful HTTP heatmap response that has no usable scores', async () => {
  network.mockImplementation(async (input: string | URL | Request) => new URL(String(input)).pathname === '/search'
    ? json({ results: [{ entity_id: 'fixture-reference', name: 'Blue Bottle Coffee' }] })
    : json({ success: true, results: { heatmap: [{ location: { latitude: 40.7336, longitude: -74.003 }, query: {} }] } }));
  await expect(compareSites(liveBrief())).rejects.toMatchObject({ status: 422 });
  expect(network).toHaveBeenCalledTimes(2);
});

it('retains shared-map evidence when one nearby dining request returns HTTP 503', async () => {
  network.mockImplementation(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname === '/search') return json({ results: [{ entity_id: 'fixture-reference', name: 'Blue Bottle Coffee' }] });
    if (url.searchParams.get('filter.type') === 'urn:heatmap') return json(heatmap());
    if (url.searchParams.get('filter.location') === 'POINT(-73.988 40.7185)') return json({ error: 'unavailable' }, 503);
    return json({ results: { entities: [] } });
  });
  const result = await compareSites(liveBrief());
  expect(result.sites[1].contextAvailable).toBe(false);
  expect(result.sites[1].cell?.affinity).toBe(.68);
  expect(result.sites[0].contextAvailable).toBe(true);
  expect(result.trace.find(t => t.step.includes('Lower East Side'))?.status).toBe('unavailable');
  expect(result.recommendation).toContain('West Village');
});
