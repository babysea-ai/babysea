import type { ApiErrorBody, RateLimitInfo } from './types';

/**
 * Error thrown when the BabySea API returns a non-2xx response.
 */
export class BabySeaError extends Error {
  /** HTTP status code. */
  readonly status: number;

  /** Structured error body from the API. */
  readonly body: ApiErrorBody;

  /** BSE error code (e.g. `BSE1004`). */
  readonly code: string;

  /** Error type (e.g. `insufficient_credits`). */
  readonly type: string;

  /** Whether this request can be retried. */
  readonly retryable: boolean;

  /** Rate limit info when available (always present on 429). */
  readonly rateLimit?: RateLimitInfo;

  /** Unique request ID for support/debugging. */
  readonly requestId?: string;

  constructor(status: number, body: ApiErrorBody, rateLimit?: RateLimitInfo) {
    super(body.error.message);
    this.name = 'BabySeaError';
    this.status = status;
    this.body = body;
    this.code = body.error.code;
    this.type = body.error.type;
    this.retryable = body.error.retryable;
    this.rateLimit = rateLimit;
    this.requestId = body.request_id ?? undefined;
  }
}

/**
 * Error thrown when a request times out.
 */
export class BabySeaTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'BabySeaTimeoutError';
  }
}

/**
 * Error thrown when all retries are exhausted.
 */
export class BabySeaRetryError extends Error {
  /** The last error that triggered this retry failure. */
  readonly lastError: BabySeaError;

  /** Number of attempts made. */
  readonly attempts: number;

  constructor(lastError: BabySeaError, attempts: number) {
    super(`All ${attempts} attempts failed. Last error: ${lastError.message}`);
    this.name = 'BabySeaRetryError';
    this.lastError = lastError;
    this.attempts = attempts;
  }
}
