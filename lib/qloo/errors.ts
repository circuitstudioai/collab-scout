export class QlooApiError extends Error {
  status: number;
  endpoint: string;
  retryable: boolean;

  constructor(message: string, options: { status: number; endpoint: string; retryable?: boolean }) {
    super(message);
    this.name = 'QlooApiError';
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.retryable = options.retryable ?? isRetryableStatus(options.status);
  }
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 502 || status === 504;
}
