/**
 * Authenticated GET helper for the Qloo hackathon API.
 * Auth: X-Api-Key (see docs.qloo.com hackathon developer guide).
 */

import { QLOO_AUTH_HEADER, resolveMaxRetries, resolveTimeoutMs } from './config';
import { QlooApiError, isRetryableStatus } from './errors';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function qlooGet<T = unknown>(options: {
  baseUrl: string;
  apiKey: string;
  path: string;
  params?: Record<string, string | undefined>;
  timeoutMs?: number;
  maxRetries?: number;
}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? resolveTimeoutMs();
  const maxRetries = options.maxRetries ?? resolveMaxRetries();
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.params || {})) {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }

  const query = params.toString();
  const url = `${options.baseUrl}${options.path}${query ? `?${query}` : ''}`;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          [QLOO_AUTH_HEADER]: options.apiKey,
        },
        signal: controller.signal,
      });

      if (response.status === 404 && options.path === '/search') {
        return { results: [] } as T;
      }

      if (!response.ok) {
        const body = await response.text();
        const retryable = isRetryableStatus(response.status);
        const error = new QlooApiError(
          `Qloo API error ${response.status} on ${options.path}: ${truncate(body)}`,
          { status: response.status, endpoint: options.path, retryable }
        );
        if (retryable && attempt < maxRetries) {
          const retryAfter = Number(response.headers.get('retry-after'));
          const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 400 * 2 ** attempt;
          await sleep(waitMs);
          lastError = error;
          continue;
        }
        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof QlooApiError) {
        throw error;
      }
      const aborted = error instanceof Error && error.name === 'AbortError';
      const wrapped = new QlooApiError(
        aborted
          ? `Qloo API timeout after ${timeoutMs}ms on ${options.path}`
          : `Qloo API request failed on ${options.path}: ${error instanceof Error ? error.message : 'unknown error'}`,
        { status: aborted ? 408 : 0, endpoint: options.path, retryable: true }
      );
      if (attempt < maxRetries) {
        await sleep(400 * 2 ** attempt);
        lastError = wrapped;
        continue;
      }
      throw wrapped;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new QlooApiError(`Qloo API request failed on ${options.path}`, {
    status: 0,
    endpoint: options.path,
  });
}

function truncate(text: string, max = 280): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > max ? `${compact.slice(0, max)}…` : compact;
}
