/**
 * Qloo client configuration.
 *
 * Auth and base URL follow the Qloo hackathon developer guide:
 * https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
 *
 * - Base URL: https://hackathon.api.qloo.com (hackathon keys do not work on staging/prod)
 * - Auth header: X-Api-Key (not Authorization Bearer)
 * - Do not use legacy /recommendations or /recs
 */

export const QLOO_HACKATHON_BASE_URL = 'https://hackathon.api.qloo.com';
export const QLOO_AUTH_HEADER = 'X-Api-Key';

export const QLOO_ENDPOINTS = {
  search: '/search',
  insights: '/v2/insights',
  tags: '/v2/tags',
  compare: '/v2/analysis/compare',
} as const;

export function resolveQlooBaseUrl(): string {
  const fromEnv =
    process.env.QLOO_API_URL ||
    process.env.QLOO_BASE_URL ||
    QLOO_HACKATHON_BASE_URL;
  return fromEnv.replace(/\/$/, '');
}

export function resolveQlooApiKey(): string {
  return (process.env.QLOO_API_KEY || '').trim();
}

/**
 * Mock is a labelled fallback only:
 * - QLOO_USE_MOCK=true (or legacy USE_QLOO_MOCK=true), or
 * - QLOO_API_KEY is missing
 */
export function shouldUseQlooMock(explicit?: boolean): boolean {
  if (typeof explicit === 'boolean') {
    return explicit;
  }
  const flag =
    process.env.QLOO_USE_MOCK === 'true' ||
    process.env.USE_QLOO_MOCK === 'true';
  if (flag) {
    return true;
  }
  return !resolveQlooApiKey();
}

export function resolveTimeoutMs(): number {
  const raw = Number(process.env.QLOO_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 15_000;
}

export function resolveCacheTtlMs(): number {
  const raw = Number(process.env.QLOO_CACHE_TTL_MS);
  return Number.isFinite(raw) && raw >= 0 ? raw : 10 * 60 * 1000;
}

export function resolveMaxRetries(): number {
  const raw = Number(process.env.QLOO_MAX_RETRIES);
  return Number.isFinite(raw) && raw >= 0 ? raw : 2;
}
