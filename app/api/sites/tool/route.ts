import { z } from 'zod';
import { briefSchema } from '@/lib/sites/schema';
export async function GET() {
  return Response.json({ name: 'compare_restaurant_sites', description: 'Resolve audience references with Qloo, gather one shared taste heatmap and nearby dining context, apply a supplied rent ceiling, and return an evidence-backed shortlist or request for better inputs. Not a sales prediction.', endpoint: '/api/sites', method: 'POST', input_schema: z.toJSONSchema(briefSchema), side_effects: 'Read-only Qloo calls; no outreach, booking, payment, or stored brief.' });
}
