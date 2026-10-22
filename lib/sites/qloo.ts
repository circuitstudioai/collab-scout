import type { Trace, ReferenceChoice } from './schema';
import { qlooGet } from '../qloo/http';
import { resolveQlooApiKey, resolveQlooBaseUrl } from '../qloo/config';
export class SiteError extends Error { constructor(message: string, public status = 422, public referenceChoice?: ReferenceChoice) { super(message); } }
export type Row = Record<string, unknown>;
export const record = (value: unknown): Row => value && typeof value === 'object' ? value as Row : {};
export function rows(raw: unknown, key: string): Row[] { const results = record(raw).results; const list = key === 'entities' && Array.isArray(results) ? results : record(results)[key]; return Array.isArray(list) ? list.map(record) : []; }

export function createReader(trace: Trace[]) {
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

return get;
}
export async function resolveReferences(brief: { references: string[]; referenceSelections?: {query:string;id:string}[] }, get: ReturnType<typeof createReader>) {
    const references: { id: string; name: string }[] = [];
    for (const name of brief.references) {
      const raw = await get(`Find ${name}`, '/search', { query: name, take: '10' }, 'entities');
      // Search has historically returned either results[] or results.entities[].
      const result = record(raw).results;
      const candidates = Array.isArray(result) ? result.map(record) : rows(raw, 'entities');
      const valid = candidates.filter(r => typeof r.name === 'string' && typeof r.entity_id === 'string' && r.entity_id.trim().length > 0);
      const matches = valid.filter(r => String(r.name).trim().toLowerCase() === name.trim().toLowerCase());
      const selected = brief.referenceSelections?.find(s => s.query === name);
      const chosen = selected ? valid.find(r => String(r.entity_id).trim() === selected.id) : matches.length === 1 ? matches[0] : undefined;
      if (!chosen) {
        if (!valid.length) throw new SiteError(`We could not find a single exact match for “${name}”. Check the name or choose another brand or place.`);
        const options = [...new Map(valid.map(r => [String(r.entity_id).trim(), r])).values()].map(r => ({
          id: String(r.entity_id).trim(), name: String(r.name),
          type: Array.isArray(r.types) ? r.types.filter((t): t is string => typeof t === 'string').map(t => t.replace('urn:entity:', '')).join(', ') : 'Entity',
          address: typeof record(r.properties).address === 'string' ? String(record(r.properties).address) : 'No address supplied',
          closed: record(r.properties).is_closed === true,
        }));
        throw new SiteError(`Choose the specific brand or place you mean by “${name}”, then compare again.`, 409, { query: name, options });
      }
      references.push({ id: String(chosen.entity_id).trim(), name: String(chosen.name) });
    }

return references;
}
