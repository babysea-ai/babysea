import { BabySeaError, BabySeaRetryError, BabySeaTimeoutError } from './errors';
import type {
  AccountData,
  ApiErrorBody,
  ApiResponse,
  BabySeaOptions,
  BabySeaRegion,
  BillingData,
  EstimateData,
  Generation,
  GenerationCancelData,
  GenerationDeleteData,
  GenerationListData,
  HealthCacheData,
  HealthModelsData,
  HealthProvidersData,
  HealthStorageData,
  ImageGenerationData,
  ImageGenerationParams,
  LibraryModelsData,
  LibraryProvidersData,
  PaginatedResponse,
  RateLimitInfo,
  StatusData,
  UsageData,
  VideoGenerationData,
  VideoGenerationParams,
} from './types';

const API_BASE_DOMAIN = 'babysea.ai';

const REGION_URLS: Record<BabySeaRegion, string> = {
  us: `https://api.us.${API_BASE_DOMAIN}`,
  eu: `https://api.eu.${API_BASE_DOMAIN}`,
};

const DEFAULT_BASE_URL = REGION_URLS.us;
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const SDK_VERSION = '1.1.0';

/**
 * BabySea API client
 *
 * @example
 * ```ts
 * import { BabySea } from 'babysea';
 *
 * // US region (default)
 * const client = new BabySea({ apiKey: 'bye_...', region: 'us' });
 *
 * // EU region
 * const eu = new BabySea({ apiKey: 'bye_...', region: 'eu' });
 *
 * // Generate an image
 * const result = await client.generate('bfl/flux-schnell', {
 *   generation_prompt: 'A baby seal plays in the Arctic',
 * });
 *
 * console.log(result.data.generation_id);
 * ```
 */
export class BabySea {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  /** HEALTH */
  readonly health: {
    /**
     * Provider health
     * 
     * `GET /v1/health/inference/providers`
     */
    providers: () => Promise<ApiResponse<HealthProvidersData>>;

    /**
     * Model health
     * 
     * `GET /v1/health/inference/models`
     */
    models: () => Promise<ApiResponse<HealthModelsData>>;

    /**
     * Storage health
     * 
     * `GET /v1/health/storage`
     */
    storage: () => Promise<ApiResponse<HealthStorageData>>;

    /**
     * Cache health
     * 
     * `GET /v1/health/cache`
     */
    cache: () => Promise<ApiResponse<HealthCacheData>>;
  };

  /** LIBRARY */
  readonly library: {
    /**
     * Available providers
     * 
     * `GET /v1/library/providers`
     */
    providers: () => Promise<ApiResponse<LibraryProvidersData>>;

    /**
     * Available models
     *
     * `GET /v1/library/models`
     */
    models: () => Promise<ApiResponse<LibraryModelsData>>;
  };

  constructor(options: BabySeaOptions) {
    if (!options.apiKey) {
      throw new Error(
        `BabySea: apiKey is required. Get one at https://${REGION_URLS.us.replace('https://api.', '')} or https://${REGION_URLS.eu.replace('https://api.', '')}`,
      );
    }

    if (!options.baseUrl && !options.region) {
      throw new Error(
        "BabySea: region is required. Use 'us' or 'eu' (e.g. { region: 'us' }).",
      );
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (
      options.baseUrl ??
      REGION_URLS[options.region!] ??
      DEFAULT_BASE_URL
    ).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

    // Bind LIBRARY namespace methods
    this.library = {
      providers: () =>
        this.request<LibraryProvidersData>('GET', '/v1/library/providers'),
      models: () =>
        this.request<LibraryModelsData>('GET', '/v1/library/models'),
    };

    // Bind HEALTH namespace methods
    this.health = {
      providers: () =>
        this.request<HealthProvidersData>('GET', '/v1/health/inference/providers'),
      models: () =>
        this.request<HealthModelsData>('GET', '/v1/health/inference/models'),
      storage: () =>
        this.request<HealthStorageData>('GET', '/v1/health/storage'),
      cache: () =>
        this.request<HealthCacheData>('GET', '/v1/health/cache'),
    };
  }

  // ─── Public API methods ───

  /**
   * API status
   *
   * `GET /v1/status`
   */
  async status(): Promise<ApiResponse<StatusData>> {
    return this.request<StatusData>('GET', '/v1/status');
  }

  /**
   * API usage
   *
   * `GET /v1/usage`
   *
   * @param days - Lookback window in days (1–90, default 30).
   */
  async usage(days?: number): Promise<ApiResponse<UsageData>> {
    const params = days !== undefined ? `?days=${days}` : '';
    return this.request<UsageData>('GET', `/v1/usage${params}`);
  }

  /**
   * User account
   *
   * `GET /v1/user/account`
   */
  async account(): Promise<ApiResponse<AccountData>> {
    return this.request<AccountData>('GET', '/v1/user/account');
  }

  /**
   * User billing
   *
   * `GET /v1/user/billing`
   */
  async billing(): Promise<ApiResponse<BillingData>> {
    return this.request<BillingData>('GET', '/v1/user/billing');
  }

  /**
   * Cost estimate
   *
   * `GET /v1/estimate/{model_identifier}`
   *
   * @param modelIdentifier - Model identifier (e.g. `"bfl/flux-schnell"`).
   * @param options.count - Number of generations to estimate (default 1).
   * @param options.duration - Duration in seconds (video models only).
   * @param options.resolution - Output resolution, e.g. `"1080p"` (resolution-priced video models only).
   * @param options.audio - Whether to include audio pricing (audio-priced video models only).
   */
  async estimate(
    modelIdentifier: string,
    options?: number | { count?: number; duration?: number; resolution?: string; audio?: boolean },
  ): Promise<ApiResponse<EstimateData>> {
    const params = new URLSearchParams();

    if (typeof options === 'number') {
      // Backwards-compatible: estimate(model, 5)
      params.set('count', String(options));
    } else if (options) {
      if (options.count !== undefined) {
        params.set('count', String(options.count));
      }

      if (options.duration !== undefined) {
        params.set('duration', String(options.duration));
      }

      if (options.resolution !== undefined) {
        params.set('resolution', options.resolution);
      }

      if (options.audio !== undefined) {
        params.set('audio', String(options.audio));
      }
    }

    const qs = params.toString();
    return this.request<EstimateData>(
      'GET',
      `/v1/estimate/${modelIdentifier}${qs ? `?${qs}` : ''}`,
    );
  }

  /**
   * Cancel generation
   *
   * `POST /v1/content/generation/cancel/{generation_id}`
   *
   * @param generationId - The `generation_id` of the generation to cancel.
   */
  async cancelGeneration(
    generationId: string,
  ): Promise<ApiResponse<GenerationCancelData>> {
    return this.request<GenerationCancelData>(
      'POST',
      `/v1/content/generation/cancel/${generationId}`,
    );
  }

  /**
   * Delete generation
   *
   * `DELETE /v1/content/{generation_id}`
   *
   * @param generationId - The `generation_id` of the generation to delete.
   */
  async deleteGeneration(
    generationId: string,
  ): Promise<ApiResponse<GenerationDeleteData>> {
    return this.request<GenerationDeleteData>(
      'DELETE',
      `/v1/content/${generationId}`,
    );
  }

  /**
   * Content info
   *
   * `GET /v1/content/{generation_id}`
   *
   * @param generationId - The `generation_id` to retrieve.
   */
  async getGeneration(generationId: string): Promise<ApiResponse<Generation>> {
    return this.request<Generation>(
      'GET',
      `/v1/content/${generationId}`,
    );
  }

  /**
   * List content
   *
   * `GET /v1/content/list`
   *
   * @param options.limit - Page size (1–100, default 50).
   * @param options.offset - Offset (default 0).
   */
  async listGenerations(options?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<GenerationListData>> {
    const params = new URLSearchParams();

    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit));
    }

    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset));
    }

    const qs = params.toString();
    const path = `/v1/content/list${qs ? `?${qs}` : ''}`;

    return this.request<GenerationListData>('GET', path) as Promise<
      PaginatedResponse<GenerationListData>
    >;
  }

  /**
   * Generate image
   *
   * `POST /v1/generate/image/{model_identifier}`
   *
   * @param modelIdentifier - Model identifier (e.g. `"bfl/flux-schnell"`).
   * @param params - Generation parameters. See {@link ImageGenerationParams}.
   */
  async generate(
    modelIdentifier: string,
    params: ImageGenerationParams,
  ): Promise<ApiResponse<ImageGenerationData>> {
    return this.request<ImageGenerationData>(
      'POST',
      `/v1/generate/image/${modelIdentifier}`,
      params,
    );
  }

  /**
   * Generate video
   *
   * `POST /v1/generate/video/{model_identifier}`
   *
   * @param modelIdentifier - Model identifier (e.g. `"google/veo-2"`).
   * @param params - Generation parameters. See {@link VideoGenerationParams}.
   */
  async generateVideo(
    modelIdentifier: string,
    params: VideoGenerationParams,
  ): Promise<ApiResponse<VideoGenerationData>> {
    return this.request<VideoGenerationData>(
      'POST',
      `/v1/generate/video/${modelIdentifier}`,
      params,
    );
  }

  // ─── HTTP Layer ───

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    let lastError: BabySeaError | undefined;
    const maxAttempts = this.maxRetries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.doRequest<T>(method, path, body);
      } catch (err) {
        if (
          err instanceof BabySeaError &&
          err.retryable &&
          attempt < maxAttempts
        ) {
          lastError = err;

          // If we got Retry-After, use that; otherwise exponential backoff
          const waitMs = err.rateLimit?.retryAfter
            ? err.rateLimit.retryAfter * 1000
            : Math.min(1000 * Math.pow(2, attempt - 1), 30_000);

          await sleep(waitMs);
          continue;
        }

        throw err;
      }
    }

    // Should not reach here, but safety net
    throw new BabySeaRetryError(lastError!, maxAttempts);
  }

  private async doRequest<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'User-Agent': `babysea/${SDK_VERSION}`,
      Accept: 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const rateLimit = parseRateLimitHeaders(response.headers);

      if (!response.ok) {
        let errorBody: ApiErrorBody;

        try {
          errorBody = (await response.json()) as ApiErrorBody;
        } catch {
          // Non-JSON error response (e.g. Cloudflare 502 HTML page)
          errorBody = {
            status: 'error',
            error: {
              code: `HTTP_${response.status}`,
              type: 'api_error',
              message: `HTTP ${response.status} ${response.statusText}`,
              retryable: response.status >= 500,
            },
          };
        }

        throw new BabySeaError(response.status, errorBody, rateLimit);
      }

      return (await response.json()) as ApiResponse<T>;
    } catch (err) {
      if (err instanceof BabySeaError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new BabySeaTimeoutError(this.timeout);
      }

      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ─── Helpers ───

function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get('X-RateLimit-Limit');

  if (!limit) {
    return undefined;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(headers.get('X-RateLimit-Remaining') ?? '0', 10),
    reset: parseInt(headers.get('X-RateLimit-Reset') ?? '0', 10),
    retryAfter: headers.has('Retry-After')
      ? parseInt(headers.get('Retry-After')!, 10)
      : undefined,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
