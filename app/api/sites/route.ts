import { briefSchema } from '@/lib/sites/schema';
import { compareSites, SiteError } from '@/lib/sites/compare';
export const maxDuration = 60;
let active = 0;
export async function GET() {
  return Response.json({ product: 'Sitebrief', liveConfigured: Boolean(process.env.QLOO_API_KEY), sample: true, note: 'Configuration is not proof of successful live integration.' });
}
export async function POST(request: Request) {
  if (active >= 4) return Response.json({ error: 'Analysis is busy. Please try again shortly.' }, { status: 429 });
  active++;
  try {
    const text = await request.text();
    if (text.length > 16000) return Response.json({ error: 'Brief is too large.' }, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(text); } catch { return Response.json({ error: 'Send a valid JSON brief.' }, { status: 400 }); }
    const parsed = briefSchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 });
    return Response.json(await compareSites(parsed.data), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof SiteError ? error.message : 'Analysis failed. Your brief has not been saved.' }, { status: error instanceof SiteError ? error.status : 500 });
  } finally { active--; }
}
