/**
 * Smoke-test live Qloo hackathon endpoints.
 * Usage: QLOO_API_KEY=... npm run qloo:smoke
 * Never prints the API key.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  QLOO_AUTH_HEADER,
  QLOO_ENDPOINTS,
  QLOO_HACKATHON_BASE_URL,
  resolveQlooApiKey,
  resolveQlooBaseUrl,
  shouldUseQlooMock,
} from '../lib/qloo/config';

function loadEnvFiles(): void {
  for (const name of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq);
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

async function call(
  baseUrl: string,
  apiKey: string,
  path: string,
  params: Record<string, string>
): Promise<{ status: number; ok: boolean; json?: unknown; error?: string; ms: number }> {
  const url = new URL(path, `${baseUrl}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        [QLOO_AUTH_HEADER]: apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    });
    const text = await response.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    return {
      status: response.status,
      ok: response.ok,
      json,
      error: response.ok ? undefined : text.slice(0, 180),
      ms: Date.now() - started,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : 'request failed',
      ms: Date.now() - started,
    };
  }
}

function countEntities(json: unknown): number {
  if (!json || typeof json !== 'object') return 0;
  const obj = json as Record<string, unknown>;
  const results = obj.results as Record<string, unknown> | unknown[] | undefined;
  if (Array.isArray(results)) return results.length;
  if (results && typeof results === 'object') {
    const entities = (results as Record<string, unknown>).entities;
    const tags = (results as Record<string, unknown>).tags;
    if (Array.isArray(entities)) return entities.length;
    if (Array.isArray(tags)) return tags.length;
  }
  if (Array.isArray(obj.entities)) return obj.entities.length;
  return 0;
}

function firstName(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const obj = json as Record<string, unknown>;
  const results = obj.results;
  const list = Array.isArray(results)
    ? results
    : results && typeof results === 'object'
      ? ((results as Record<string, unknown>).entities as unknown[]) ||
        ((results as Record<string, unknown>).tags as unknown[]) ||
        []
      : [];
  const first = list[0] as Record<string, unknown> | undefined;
  return first && typeof first.name === 'string' ? first.name : '';
}

function firstId(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const obj = json as Record<string, unknown>;
  const results = obj.results;
  const list = Array.isArray(results)
    ? results
    : results && typeof results === 'object'
      ? ((results as Record<string, unknown>).entities as unknown[]) || []
      : [];
  const first = list[0] as Record<string, unknown> | undefined;
  return first ? String(first.entity_id || first.id || '') : '';
}

async function main(): Promise<void> {
  loadEnvFiles();

  if (shouldUseQlooMock()) {
    console.error(
      'qloo:smoke needs a live key. Set QLOO_API_KEY and leave QLOO_USE_MOCK unset/false.'
    );
    process.exit(1);
  }

  const apiKey = resolveQlooApiKey();
  const baseUrl = resolveQlooBaseUrl();

  console.log('Qloo smoke test');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Auth header: ${QLOO_AUTH_HEADER} (value not printed)`);
  console.log(`Key present: yes (length ${apiKey.length})`);
  if (baseUrl !== QLOO_HACKATHON_BASE_URL) {
    console.log(`Note: default hackathon host is ${QLOO_HACKATHON_BASE_URL}`);
  }

  const search = await call(baseUrl, apiKey, QLOO_ENDPOINTS.search, {
    query: 'Nike',
    types: 'urn:entity:brand',
    take: '3',
  });
  printRow('GET /search', search, `${countEntities(search.json)} entities${firstName(search.json) ? `, e.g. ${firstName(search.json)}` : ''}`);

  const insights = await call(baseUrl, apiKey, QLOO_ENDPOINTS.insights, {
    'filter.type': 'urn:entity:brand',
    'signal.location.query': 'United States',
    take: '5',
  });
  printRow(
    'GET /v2/insights',
    insights,
    `${countEntities(insights.json)} brand affinities${firstName(insights.json) ? `, e.g. ${firstName(insights.json)}` : ''}`
  );

  const tags = await call(baseUrl, apiKey, QLOO_ENDPOINTS.tags, {
    'filter.query': 'sustainability',
    take: '5',
  });
  printRow('GET /v2/tags', tags, `${countEntities(tags.json)} tags${firstName(tags.json) ? `, e.g. ${firstName(tags.json)}` : ''}`);

  const idA = firstId(search.json);
  const compareParams: Record<string, string> = {};
  if (idA) {
    compareParams['a.signal.interests.entities'] = idA;
    compareParams['b.signal.interests.entities'] = idA;
  }
  const compare = await call(baseUrl, apiKey, QLOO_ENDPOINTS.compare, compareParams);
  printRow(
    'GET /v2/analysis/compare',
    compare,
    idA ? `compared entity ${idA.slice(0, 8)}…` : 'skipped ids (search returned none)'
  );

  const failed = [search, insights, tags, compare].filter((r) => !r.ok);
  if (failed.length) {
    console.error(`\n${failed.length} endpoint(s) failed. Check key, host, and params.`);
    process.exit(1);
  }
  console.log('\nAll smoke calls returned HTTP 2xx.');
}

function printRow(
  label: string,
  result: { status: number; ok: boolean; error?: string; ms: number },
  summary: string
): void {
  const mark = result.ok ? 'ok' : 'FAIL';
  const extra = result.error ? ` error=${result.error.replace(/\s+/g, ' ').slice(0, 160)}` : '';
  console.log(`${mark}  ${label}  HTTP ${result.status}  ${result.ms}ms  ${summary}${extra}`);
}

main().catch((error) => {
  console.error('Smoke test crashed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
