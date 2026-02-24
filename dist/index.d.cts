import { A as ApiResponse, H as HealthProvidersData, a as HealthModelsData, b as HealthStorageData, c as HealthCacheData, L as LibraryProvidersData, d as LibraryModelsData, B as BabySeaOptions, S as StatusData, U as UsageData, e as AccountData, f as BillingData, E as EstimateData, G as GenerationCancelData, g as GenerationDeleteData, h as Generation, P as PaginatedResponse, i as GenerationListData, I as ImageGenerationParams, j as ImageGenerationData, V as VideoGenerationParams, k as VideoGenerationData, l as ApiErrorBody, R as RateLimitInfo } from './types-9mmJNI_Q.cjs';
export { m as ApiKeyScope, n as ApiKeyScopePreset, o as BabySeaRegion, p as HealthModel, q as HealthModelProvider, r as HealthProvider, M as Model, s as ModelSchema, t as ProviderProfile, u as UsageEndpoint, v as UsageProvider, W as WebhookEventType, w as WebhookPayload } from './types-9mmJNI_Q.cjs';

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
 * const result = await client.generate('{model_identifier}', {
 *   generation_prompt: 'A cute baby seal on the beach',
 * });
 *
 * console.log(result.data.generation_id);
 * ```
 */
declare class BabySea {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    private readonly maxRetries;
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
         * `GET /v1/library/models`
         */
        models: () => Promise<ApiResponse<LibraryModelsData>>;
    };
    constructor(options: BabySeaOptions);
    /**
     * API status
     *
     * `GET /v1/status`
     */
    status(): Promise<ApiResponse<StatusData>>;
    /**
     * API usage
     *
     * `GET /v1/usage`
     *
     * @param days - Lookback window in days (1–90, default 30).
     */
    usage(days?: number): Promise<ApiResponse<UsageData>>;
    /**
     * User account
     *
     * `GET /v1/user/account`
     */
    account(): Promise<ApiResponse<AccountData>>;
    /**
     * User billing
     *
     * `GET /v1/user/billing`
     */
    billing(): Promise<ApiResponse<BillingData>>;
    /**
     * Cost estimate
     *
     * `GET /v1/estimate/{model_identifier}`
     *
     * @param model - Model identifier (e.g. `"{model_identifier}"`).
     * @param count - Number of generations to estimate (default 1).
     */
    estimate(model: string, count?: number): Promise<ApiResponse<EstimateData>>;
    /**
     * Cancel generation
     *
     * `POST /v1/content/generation/cancel/{generation_id}`
     *
     * @param generationId - The `generation_id` of the generation to cancel.
     */
    cancelGeneration(generationId: string): Promise<ApiResponse<GenerationCancelData>>;
    /**
     * Delete generation
     *
     * `DELETE /v1/content/{generation_id}`
     *
     * @param generationId - The `generation_id` of the generation to delete.
     */
    deleteGeneration(generationId: string): Promise<ApiResponse<GenerationDeleteData>>;
    /**
     * Content info
     *
     * `GET /v1/content/{generation_id}`
     *
     * @param generationId - The `generation_id` to retrieve.
     */
    getGeneration(generationId: string): Promise<ApiResponse<Generation>>;
    /**
     * List content
     *
     * `GET /v1/content/list`
     *
     * @param options.limit - Page size (1–100, default 50).
     * @param options.offset - Offset (default 0).
     */
    listGenerations(options?: {
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<GenerationListData>>;
    /**
     * Generate image
     *
     * `POST /v1/generate/image/{model_identifier}`
     *
     * @param model - Model identifier (e.g. `"{model_identifier}"`).
     * @param params - Generation parameters. See {@link ImageGenerationParams}.
     */
    generate(model: string, params: ImageGenerationParams): Promise<ApiResponse<ImageGenerationData>>;
    /**
     * Generate video
     *
     * `POST /v1/generate/video/{model_identifier}`
     *
     * @param model - Model identifier (e.g. `"{model_identifier}"`).
     * @param params - Generation parameters. See {@link VideoGenerationParams}.
     */
    generateVideo(model: string, params: VideoGenerationParams): Promise<ApiResponse<VideoGenerationData>>;
    private request;
    private doRequest;
}

/**
 * Error thrown when the BabySea API returns a non-2xx response.
 */
declare class BabySeaError extends Error {
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
    constructor(status: number, body: ApiErrorBody, rateLimit?: RateLimitInfo);
}
/**
 * Error thrown when a request times out.
 */
declare class BabySeaTimeoutError extends Error {
    constructor(timeoutMs: number);
}
/**
 * Error thrown when all retries are exhausted.
 */
declare class BabySeaRetryError extends Error {
    /** The last error that triggered this retry failure. */
    readonly lastError: BabySeaError;
    /** Number of attempts made. */
    readonly attempts: number;
    constructor(lastError: BabySeaError, attempts: number);
}

export { AccountData, ApiErrorBody, ApiResponse, BabySea, BabySeaError, BabySeaOptions, BabySeaRetryError, BabySeaTimeoutError, BillingData, EstimateData, Generation, GenerationCancelData, GenerationDeleteData, GenerationListData, HealthCacheData, HealthModelsData, HealthProvidersData, HealthStorageData, ImageGenerationData, ImageGenerationParams, LibraryModelsData, LibraryProvidersData, PaginatedResponse, RateLimitInfo, StatusData, UsageData, VideoGenerationData, VideoGenerationParams };
