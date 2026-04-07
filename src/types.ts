// ─── Client Options ───

/** Deployment region. Determines which regional API endpoint to use. */
export type BabySeaRegion = 'us' | 'eu' | 'jp';

export interface BabySeaOptions {
  /** API key (e.g. `bye_...`). Required. */
  apiKey: string;

  /**
   * Region for the API endpoint.
   *
   * - `'us'` → US regional endpoint
   * - `'eu'` → EU regional endpoint
   * - `'jp'` → APAC regional endpoint
   *
   * Defaults to `'us'` when both `region` and `baseUrl` are omitted.
   * Ignored when `baseUrl` is provided.
   */
  region?: BabySeaRegion;

  /** Full base URL override. Takes precedence over `region`. */
  baseUrl?: string;

  /** Request timeout in milliseconds. Defaults to `30_000` (30s). */
  timeout?: number;

  /** Maximum number of automatic retries for retryable API errors. Defaults to `2`. */
  maxRetries?: number;
}

// ─── Success Envelope ───

export interface ApiResponse<T> {
  status: 'success';
  request_id: string;
  message: string;
  timestamp: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  limit: number;
  offset: number;
}

// ─── Error Envelope ───

export interface ApiErrorBody {
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

// ─── Rate Limit Info ───

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// ─── /v1/health/inference/providers ───

export interface HealthProvider {
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

export interface HealthProvidersData {
  service: 'providers';
  healthy: boolean;
  providers: HealthProvider[];
  providers_total: number;
}

// ─── /v1/health/inference/models ───

export interface HealthModelProvider {
  available: boolean;
  raw_model_id: string | null;
}

export interface HealthModel {
  model_identifier: string;
  model_pricing: number | undefined;
  providers: Record<string, HealthModelProvider>;
}

export interface HealthModelsData {
  service: 'models';
  healthy: boolean;
  models: HealthModel[];
  models_total: number;
}

// ─── /v1/health/storage ───

export interface HealthStorageData {
  service: 'storage';
  healthy: boolean;
  latency_ms: number;
  bucket: string;
  error?: string;
}

// ─── /v1/health/cache ───

export interface HealthCacheData {
  service: 'redis';
  healthy: boolean;
  latency_ms: number;
  error?: string;
}

// ─── /v1/library/providers ───

export interface BabySeaImplementation {
  delivery_method: 'webhook_with_polling' | 'synchronous';
  cancel_method: 'prediction_cancel_api' | 'queue_cancel_api' | null;
  webhook_verification: 'hmac_sha256' | 'ed25519' | null;
  error_mapping: 'bse_error_codes';
  cost_tracking: 'per_generation_usd';
  schema_conversion: 'unified_to_native';
  failover_strategy: 'sequential_provider_chain';
  health_monitoring: 'circuit_breaker';
  supported_media_types: ('image' | 'video')[];
  supported_models_total: number;
}

export interface ProviderProfile {
  provider_id: string;
  provider_name: string;
  provider_description: string;
  provider_website: string;
  provider_docs: string;
  provider_status: string;
  babysea_implementation: BabySeaImplementation;
}

export interface LibraryProvidersData {
  providers: ProviderProfile[];
  providers_total: number;
}

// ─── /v1/library/models ───

export interface ModelSchema {
  generation_prompt: boolean;
  generation_ratio: string[];
  generation_output_format: string[];
  generation_output_number: number;
  generation_input_file: boolean;
  /** Accepted duration values in seconds (video models only). */
  generation_duration?: number[];
  /** Supported output resolutions (resolution-priced video models only). */
  generation_resolution?: string[];
  /** Whether audio generation is supported (audio-priced video models only). */
  generation_generate_audio?: boolean;
}

export interface Model {
  model_type: 'image' | 'video';
  model_identifier: string;
  /**
   * Credits per generation.
   *
   * - **Flat-priced models** → `number` (credits per generation or per second for duration-based video models).
   * - **Resolution-priced models** → `Record<string, number>` mapping each resolution to its per-second cost.
   * - `undefined` when no pricing entry exists for the model.
   */
  model_pricing: number | Record<string, number> | undefined;
  model_supported_provider: string[];
  schema: ModelSchema;
  specific_schema: string[];
}

export interface LibraryModelsData {
  models: Model[];
  models_total: number;
}

// ─── /v1/status ───

export interface StatusData {
  account_id: string;
  apikey_id: string;
  apikey_name: string | null;
  apikey_prefix: string | null;
  apikey_created_at: string | null;
  apikey_last_used_at: string | null;
  apikey_expires_at: string | null;
}

// ─── /v1/usage ───

export interface UsageEndpoint {
  endpoint: string;
  total_requests: number;
  success_count: number;
  client_error_count: number;
  server_error_count: number;
  error_codes: Record<string, number>;
}

export interface UsageProvider {
  provider: string;
  total_submissions: number;
  used_count: number;
  cancelled_count: number;
  discarded_count: number;
  failed_count: number;
  total_estimated_cost: number;
  wasted_estimated_cost: number;
}

export interface UsageData {
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

// ─── /v1/user/account ───

export interface AccountData {
  account_id: string;
  account_name: string;
  account_email: string | null;
  account_is_personal: boolean;
  account_picture_url: string | null;
  account_created_at: string;
}

// ─── /v1/user/billing ───

export interface BillingData {
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

// ─── /v1/estimate/{model_identifier} ───

export interface EstimateData {
  model_identifier: string;
  model_type: 'image' | 'video';
  assets_count: number;
  /** Per-second cost for video models. For resolution-priced models, this is the rate for the selected resolution. */
  cost_per_second?: number;
  /** Requested duration in seconds (only present for video models). */
  duration_seconds?: number;
  /** Output resolution (only present for resolution-priced video models). */
  resolution?: string;
  cost_per_generation: number;
  cost_total_consumed: number;
  credit_balance: number;
  credit_balance_can_afford: boolean;
  credit_balance_max_affordable: number;
}

// ─── /v1/content/generation/cancel/{generation_id} (POST) ───

export interface GenerationCancelData {
  generation_id: string;
  generation_status: 'canceled';
  provider_cancel_sent: boolean;
  credits_refunded: boolean;
}

// ─── /v1/content/{generation_id} (DELETE) ───

export interface GenerationDeleteData {
  generation_id: string;
  files_deleted: number;
}

// ─── /v1/content/{generation_id} (GET) ───

export interface Generation {
  // Identity
  account_id: string;
  model_identifier: string;
  generation_provider_order: string[];
  generation_provider_used: string | null;
  generation_prediction_id: string | null;
  generation_id: string;
  // Status
  generation_status:
    | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'canceled';
  // Input
  generation_prompt: string;
  generation_ratio: string;
  generation_output_format: string;
  generation_output_number: number;
  generation_input_file: string[] | null;
  // Output
  generation_output_file: string[] | null;
  // Timing
  generation_created_at: string;
  generation_started_at: string | null;
  generation_completed_at: string | null;
  // Metrics
  generation_metrics_total_time: number | null;
  generation_metrics_predict_time: number | null;
  // Duration, resolution & audio (video models only)
  generation_duration?: number;
  generation_resolution?: string;
  /**
   * Stringified boolean - the API serializes this boolean field as `"true"` or
   * `"false"` (same as all non-preserved primitives in generation_data).
   */
  generation_generate_audio?: string;
  // Errors (only present on failure)
  generation_error?: string;
  generation_error_code?: string;
  // Cleanup (only present after files are removed)
  generation_removed?: string;
}

// ─── /v1/content/list (GET) ───

export interface GenerationListData {
  generations: Generation[];
}

// ─── /v1/generate/image (POST) ───

export type InferenceProvider =
  | 'replicate'
  | 'fal'
  | 'byteplus'
  | 'cloudflare'
  | 'bfl'
  | 'openai';

/**
 * All valid provider order strings for image generation.
 *
 * - replicate
 * - fal
 * - byteplus
 * - cloudflare
 * - bfl
 * - openai
 *
 * See shared-constants.ts for all valid combinations.
 */
export type GenerationProviderOrder =
  | 'replicate'
  | 'replicate, fal'
  | 'fal, replicate'
  | 'bfl, replicate'
  | 'replicate, bfl'
  | 'openai, replicate'
  | 'replicate, openai'
  | 'byteplus, replicate, fal'
  | 'openai, replicate, fal'
  | 'cloudflare, replicate, fal'
  | 'cloudflare, replicate, bfl';

export interface ImageGenerationParams {
  /** Text prompt. Required. */
  generation_prompt: string;

  /** Aspect ratio, e.g. `"1:1"`, `"16:9"`. */
  generation_ratio?: string;

  /** Output format: `"png"`, `"jpg"`, or `"webp"`. */
  generation_output_format?: string;

  /** Number of output images (1-N, model-dependent). */
  generation_output_number?: number;

  /** Array of public URLs for input files. */
  generation_input_file?: string[];

  /**
   * Preferred inference provider order.
   *
   * Most models accept `"replicate, fal"` or `"fal, replicate"`.
   * Some models also support additional providers such as BytePlus, Cloudflare, BFL, or OpenAI.
   * Use `client.library.models()` to check supported providers per model.
   *
   * When omitted, the model's default order is used.
   */
  generation_provider_order?: GenerationProviderOrder;

  /** Model-specific parameters (varies per model). */
  [key: string]: unknown;
}

export type ImageGenerationData =
  | {
      model_identifier: string;
      generation_provider_order: string[];
      generation_prediction_id: string;
      generation_id: string;
      generation_initialized: true;
    }
  | {
      /** Returned when the generation was canceled before completion. */
      generation_id: string;
      generation_status: 'canceled';
    };

// ─── /v1/generate/video (POST) ───

export interface VideoGenerationParams {
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

  /** Whether to generate audio. Required for audio-priced video models. */
  generation_generate_audio?: boolean;

  /** Array of public URLs for input files (e.g. image-to-video). */
  generation_input_file?: string[];

  /**
   * Public URL for the last frame of a video (image-to-video models that accept a
   * distinct end-frame input). Validated and combined with `generation_input_file`
   * server-side.
   */
  generation_input_file_last_content?: string;

  /**
   * Preferred inference provider order.
   *
   * Most models accept `"replicate, fal"` or `"fal, replicate"`.
   * Some models also support BytePlus or OpenAI. Video routes do not accept Cloudflare or BFL.
   * Use `client.library.models()` to check supported providers per model.
   *
   * When omitted, the model's default order is used.
   */
  generation_provider_order?:
    | 'replicate, fal'
    | 'fal, replicate'
    | 'bfl, replicate'
    | 'replicate, bfl'
    | 'openai, replicate'
    | 'replicate, openai'
    | 'byteplus, replicate, fal'
    | 'openai, replicate, fal'
    | 'cloudflare, replicate, fal'
    | 'cloudflare, replicate, bfl';

  /** Model-specific parameters (varies per model). */
  [key: string]: unknown;
}

export type VideoGenerationData =
  | {
      model_identifier: string;
      generation_provider_order: string[];
      generation_prediction_id: string;
      generation_id: string;
      generation_initialized: true;
    }
  | {
      /** Returned when the generation was canceled before completion. */
      generation_id: string;
      generation_status: 'canceled';
    };

// ─── Unified generate() types ───

/**
 * Union of image and video generation parameters.
 * Used by `client.generate()` which auto-detects image vs video
 * based on the presence of `generation_duration`.
 */
export type GenerationParams = ImageGenerationParams | VideoGenerationParams;

/**
 * Union of image and video generation response data.
 * Structurally identical - both return `generation_id` + `generation_initialized`.
 */
export type GenerationData = ImageGenerationData | VideoGenerationData;

// ─── API Key Scopes ───

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
export type ApiKeyScope =
  | 'generation:write'
  | 'generation:read'
  | 'generation:delete'
  | 'account:read'
  | 'health:read'
  | 'library:read';

/** Preset scope bundles for common use cases. */
export type ApiKeyScopePreset =
  | 'full_access'
  | 'generate_only'
  | 'read_only'
  | 'monitor_only';

// ─── Webhook Types ───

export type WebhookEventType =
  | 'generation.started'
  | 'generation.completed'
  | 'generation.failed'
  | 'generation.canceled'
  | 'credits.low_balance'
  | 'webhook.test';

export interface GenerationWebhookPayload {
  webhook_event:
    | 'generation.started'
    | 'generation.completed'
    | 'generation.failed'
    | 'generation.canceled'
    | 'webhook.test';
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

export interface CreditAlertWebhookPayload {
  webhook_event: 'credits.low_balance';
  webhook_timestamp: string;
  webhook_delivery_id: string;
  webhook_data: {
    account_id: string;
    current_balance: number;
    thresholds_crossed: {
      threshold: number;
      balance_at: number;
    }[];
  };
}

export type WebhookPayload =
  | GenerationWebhookPayload
  | CreditAlertWebhookPayload;
