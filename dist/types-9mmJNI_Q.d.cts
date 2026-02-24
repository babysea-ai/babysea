/** Deployment region. Determines which regional API endpoint to use. */
type BabySeaRegion = 'us' | 'eu';
interface BabySeaOptions {
    /** API key (e.g. `bye_...`). Required. */
    apiKey: string;
    /**
     * Region for the API endpoint.
     *
     * - `'us'` → US regional endpoint
     * - `'eu'` → EU regional endpoint
     *
     * Required unless `baseUrl` is provided.
     */
    region?: BabySeaRegion;
    /** Full base URL override. Takes precedence over `region`. */
    baseUrl?: string;
    /** Request timeout in milliseconds. Defaults to `30_000` (30s). */
    timeout?: number;
    /** Maximum number of automatic retries for retryable errors (429, 5xx). Defaults to `2`. */
    maxRetries?: number;
}
interface ApiResponse<T> {
    status: 'success';
    request_id: string;
    message: string;
    timestamp: string;
    data: T;
}
interface PaginatedResponse<T> extends ApiResponse<T> {
    total: number;
    limit: number;
    offset: number;
}
interface ApiErrorBody {
    status: 'error';
    request_id?: string;
    error: {
        code: string;
        type: string;
        message: string;
        retryable: boolean;
        details?: Record<string, unknown>;
        provider_errors?: Array<{
            provider: string;
            code: string;
            type: string;
            message: string;
            retryable: boolean;
        }>;
    };
}
interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}
interface HealthProvider {
    provider: string;
    status: 'healthy' | 'recovering' | 'degraded' | 'unknown';
    failure_rate: number;
    window: {
        total_attempts: number;
        failures: number;
        successes: number;
        duration_seconds: number;
    };
}
interface HealthProvidersData {
    service: 'providers';
    healthy: boolean;
    providers: HealthProvider[];
    providers_total: number;
}
interface HealthModelProvider {
    available: boolean;
    raw_model_id: string | null;
}
interface HealthModel {
    model_identifier: string;
    model_pricing: number | undefined;
    providers: Record<string, HealthModelProvider>;
}
interface HealthModelsData {
    service: 'models';
    healthy: boolean;
    models: HealthModel[];
    models_total: number;
}
interface HealthStorageData {
    service: 'storage';
    healthy: boolean;
    latency_ms: number;
    bucket: string;
    error?: string;
}
interface HealthCacheData {
    service: 'redis';
    healthy: boolean;
    latency_ms: number;
    error?: string;
}
interface ProviderProfile {
    provider_id: string;
    provider_name: string;
    provider_description: string;
    provider_website: string;
    provider_docs: string;
    provider_status: string;
    babysea_implementation: {
        integration: {
            delivery_method: string;
            webhook_signature: string;
            supports_cancel: boolean;
            timeout_seconds: number;
        };
        capabilities: string[];
        supported_models: string[];
    };
}
interface LibraryProvidersData {
    providers: ProviderProfile[];
    providers_total: number;
}
interface ModelSchema {
    generation_prompt: boolean;
    generation_ratio: string[];
    generation_output_format: string[];
    generation_output_number: number;
    generation_input_file: boolean;
    /** Duration range in seconds (video models only). */
    generation_duration?: {
        min: number;
        max: number;
    };
    /** Supported output resolutions (resolution-priced video models only). */
    generation_resolution?: string[];
}
interface Model {
    model_type: 'image' | 'video';
    model_identifier: string;
    /**
     * Credits per generation.
     *
     * - **Flat-priced models** → `number` (credits per generation or per second for duration-based video models).
     * - **Resolution-priced models** → `Record<string, number>` mapping each resolution to its per-second cost.
     */
    model_pricing: number | Record<string, number>;
    model_supported_provider: string[];
    schema: ModelSchema;
    specific_schema: string[];
}
interface LibraryModelsData {
    models: Model[];
    models_total: number;
}
interface StatusData {
    account_id: string;
    apikey_id: string;
    apikey_name: string | null;
    apikey_prefix: string | null;
    apikey_created_at: string | null;
    apikey_last_used_at: string | null;
    apikey_expires_at: string | null;
}
interface UsageEndpoint {
    endpoint: string;
    total_requests: number;
    success_count: number;
    client_error_count: number;
    server_error_count: number;
    error_codes: Record<string, number>;
}
interface UsageProvider {
    provider: string;
    total_submissions: number;
    used_count: number;
    cancelled_count: number;
    discarded_count: number;
    failed_count: number;
    total_estimated_cost: number;
    wasted_estimated_cost: number;
}
interface UsageData {
    account_id: string;
    usage_period_days: number;
    usage_credit_balance: number;
    usage_total_requests: number;
    usage_total_success: number;
    usage_total_client_errors: number;
    usage_total_server_errors: number;
    usage_total_generations: number;
    usage_total_provider_submissions: number;
    usage_total_estimated_cost: number;
    usage_endpoints: UsageEndpoint[];
    usage_providers: UsageProvider[];
}
interface AccountData {
    account_id: string;
    account_name: string;
    account_email: string | null;
    account_is_personal: boolean;
    account_picture_url: string | null;
    account_created_at: string;
}
interface BillingData {
    account_id: string;
    billing_plan: string | null;
    billing_credit_balance: number;
    billing_subscription_status: string | null;
    billing_cancel_at_period_end: boolean | null;
    billing_currency: string | null;
    billing_period_starts_at: string | null;
    billing_period_ends_at: string | null;
    billing_created_at: string | null;
    billing_updated_at: string | null;
}
interface EstimateData {
    model_identifier: string;
    model_type: 'image' | 'video';
    assets_count: number;
    /** Per-second cost (only present for video models with duration-based pricing). */
    cost_per_second?: number;
    /** Requested duration in seconds (only present for video models). */
    duration_seconds?: number;
    cost_per_generation: number;
    cost_total_consumed: number;
    credit_balance: number;
    credit_balance_can_afford: boolean;
    credit_balance_max_affordable: number;
}
interface GenerationCancelData {
    generation_id: string;
    generation_status: 'canceled';
    provider_cancel_sent: boolean;
    credits_refunded: boolean;
}
interface GenerationDeleteData {
    generation_id: string;
    files_deleted: number;
}
interface Generation {
    account_id: string;
    model_identifier: string;
    generation_provider_order: string[];
    generation_provider_used: string | null;
    generation_prediction_id: string | null;
    generation_id: string;
    generation_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    generation_prompt: string;
    generation_ratio: string;
    generation_output_format: string;
    generation_output_number: number;
    generation_input_file: string[] | null;
    generation_output_file: string[] | null;
    generation_created_at: string;
    generation_started_at: string | null;
    generation_completed_at: string | null;
    generation_metrics_total_time: number | null;
    generation_metrics_predict_time: number | null;
    generation_duration?: number;
    generation_resolution?: string;
    generation_error?: string;
    generation_error_code?: string;
    generation_removed?: string;
}
interface GenerationListData {
    generations: Generation[];
}
interface ImageGenerationParams {
    /** Text prompt. Required. */
    generation_prompt: string;
    /** Aspect ratio, e.g. `"1:1"`, `"16:9"`. */
    generation_ratio?: string;
    /** Output format: `"png"`, `"jpeg"`, or `"webp"`. */
    generation_output_format?: string;
    /** Number of output images (1–N, model-dependent). */
    generation_output_number?: number;
    /** Array of public URLs for input files. */
    generation_input_file?: string[];
    /**
     * Preferred inference provider order.
     *
     * Most models accept `"replicate, fal"` or `"fal, replicate"`.
     * Some models also support additional providers such as BytePlus.
     * Use `client.library.models()` to check supported providers per model.
     *
     * When omitted, the model's default order is used.
     */
    generation_provider_order?: 'replicate, fal' | 'fal, replicate' | 'byteplus, replicate, fal' | 'byteplus, fal, replicate';
    /** Model-specific parameters (varies per model). */
    [key: string]: unknown;
}
type ImageGenerationData = {
    model_identifier: string;
    generation_provider_order: string[];
    generation_prediction_id: string;
    generation_id: string;
    generation_initialized: true;
} | {
    /** Returned when the generation was canceled before completion. */
    generation_id: string;
    generation_status: 'canceled';
};
interface VideoGenerationParams {
    /** Text prompt. Required. */
    generation_prompt: string;
    /** Aspect ratio, e.g. `"16:9"`, `"9:16"`. */
    generation_ratio?: string;
    /** Output format: `"mp4"`. */
    generation_output_format?: string;
    /** Duration in seconds. Required for all video models. Range varies per model. */
    generation_duration: number;
    /**
     * Output resolution. Required for resolution-priced video models.
     * Use `client.library.models()` to check supported resolutions per model.
     */
    generation_resolution?: string;
    /** Array of public URLs for input files (e.g. image-to-video). */
    generation_input_file?: string[];
    /**
     * Preferred inference provider order.
     *
     * Most models accept `"replicate, fal"` or `"fal, replicate"`.
     * Some models also support additional providers such as BytePlus.
     * Use `client.library.models()` to check supported providers per model.
     *
     * When omitted, the model's default order is used.
     */
    generation_provider_order?: 'replicate, fal' | 'fal, replicate' | 'byteplus, replicate, fal' | 'byteplus, fal, replicate';
    /** Model-specific parameters (varies per model). */
    [key: string]: unknown;
}
type VideoGenerationData = {
    model_identifier: string;
    generation_provider_order: string[];
    generation_prediction_id: string;
    generation_id: string;
    generation_initialized: true;
} | {
    /** Returned when the generation was canceled before completion. */
    generation_id: string;
    generation_status: 'canceled';
};
/**
 * Named API key scopes that control access to v1 endpoints.
 *
 * - `generation:write`  → POST /v1/generate/image/:model, POST /v1/generate/video/:model
 * - `generation:read`   → GET  /v1/content/:id, GET /v1/content/list
 * - `generation:delete` → DELETE /v1/content/:id, POST /v1/content/generation/cancel/:id
 * - `account:read`      → GET  /v1/user/account, /v1/user/billing, /v1/usage, /v1/status
 * - `health:read`       → GET  /v1/health/*
 * - `library:read`      → GET  /v1/library/*, /v1/estimate/*
 */
type ApiKeyScope = 'generation:write' | 'generation:read' | 'generation:delete' | 'account:read' | 'health:read' | 'library:read';
/** Preset scope bundles for common use cases. */
type ApiKeyScopePreset = 'full_access' | 'generate_only' | 'read_only' | 'monitor_only';
type WebhookEventType = 'generation.started' | 'generation.completed' | 'generation.failed' | 'generation.canceled' | 'webhook.test';
interface WebhookPayload {
    webhook_event: WebhookEventType;
    webhook_timestamp: string;
    webhook_delivery_id: string;
    webhook_data: {
        account_id: string;
        model_identifier: string;
        generation_provider_initialize?: string;
        generation_provider_used?: string;
        generation_status: 'processing' | 'succeeded' | 'failed' | 'canceled';
        generation_prediction_id?: string;
        generation_id: string;
        generation_output_file?: string[];
        generation_error?: string;
        generation_error_code?: string;
        credits_refunded?: boolean;
    };
}

export type { ApiResponse as A, BabySeaOptions as B, EstimateData as E, GenerationCancelData as G, HealthProvidersData as H, ImageGenerationParams as I, LibraryProvidersData as L, Model as M, PaginatedResponse as P, RateLimitInfo as R, StatusData as S, UsageData as U, VideoGenerationParams as V, WebhookEventType as W, HealthModelsData as a, HealthStorageData as b, HealthCacheData as c, LibraryModelsData as d, AccountData as e, BillingData as f, GenerationDeleteData as g, Generation as h, GenerationListData as i, ImageGenerationData as j, VideoGenerationData as k, ApiErrorBody as l, ApiKeyScope as m, ApiKeyScopePreset as n, BabySeaRegion as o, HealthModel as p, HealthModelProvider as q, HealthProvider as r, ModelSchema as s, ProviderProfile as t, UsageEndpoint as u, UsageProvider as v, WebhookPayload as w };
