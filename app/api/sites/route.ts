import { briefSchema } from '@/lib/sites/schema';
import { compareSites, SiteError } from '@/lib/sites/compare';
export const maxDuration = 60;
let active = 0;
export async function GET() {
  return Response.json({ product: 'Sitebrief', liveConfigured: Boolean(process.env.QLOO_API_KEY), sample: true, note: 'Configuration is not proof of successful live integration.' });
}
export async function POST(request: Request) {
  if (active >= 4) return Response.json({ error: 'Other comparisons are running. Please try again shortly.' }, { status: 429 });
  active++;
  try {
    const text = await request.text();
    if (text.length > 16000) return Response.json({ error: 'Your entries are too long. Shorten them and try again.' }, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(text); } catch { return Response.json({ error: 'Send a valid JSON brief.' }, { status: 400 }); }
    const parsed = briefSchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 });
    return Response.json(await compareSites(parsed.data), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof SiteError ? error.message : 'We could not finish the comparison. Please try again. Sitebrief has not saved your entries.' }, { status: error instanceof SiteError ? error.status : 500 });
  } finally { active--; }
}
