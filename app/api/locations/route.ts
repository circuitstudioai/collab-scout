import { parseLocations, type LocationMatch } from '@/lib/sites/locations';
const cache = new Map<string, { expires: number; locations: LocationMatch[] }>();
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get('q')?.trim() ?? '';
  const lat = params.get('lat'), lon = params.get('lon');
  if (query.length < 2 || query.length > 300 || ((lat !== null || lon !== null) && (lat === null || lon === null || !lat.trim() || !lon.trim() || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon)) || Math.abs(Number(lat)) > 85 || Math.abs(Number(lon)) > 180))) return Response.json({ error: 'Enter a city, neighborhood or address to search.' }, { status: 400 });
  const key = JSON.stringify([query.toLowerCase(), lat, lon]);
  const saved = cache.get(key);
  if (saved && saved.expires > Date.now()) return Response.json({ locations: saved.locations });
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query); url.searchParams.set('limit', '5'); url.searchParams.set('lang', 'en');
  if (lat !== null && lon !== null) { url.searchParams.set('lat', lat); url.searchParams.set('lon', lon); }
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Sitebrief/1.0 (https://github.com/circuitstudioai/collab-scout)', Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Location provider unavailable');
    const locations = parseLocations(await response.json());
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 300000, locations });
    return Response.json({ locations });
  } catch { return Response.json({ error: 'Location search is unavailable. Try again, or use the map or manual coordinates.' }, { status: 502 }); }
}
