# BabySea

Official TypeScript SDK for the [BabySea API](https://babysea.ai). BabySea offers one API for image and video generation across multiple AI inference providers, with automatic failover and a unified schema.

[![npm version](./badges/version.svg)](https://www.npmjs.com/package/babysea) [![license](./badges/license.svg)](./LICENSE) [![npm type definitions](./badges/types.svg)](https://www.typescriptlang.org/) [![node](./badges/node.svg)](https://nodejs.org/en/about/previous-releases) [![US region](https://uptime.betterstack.com/status-badges/v1/monitor/2got6.svg)](https://uptime.betterstack.com/?utm_source=status_badge) [![EU region](https://uptime.betterstack.com/status-badges/v1/monitor/2goty.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

- **Zero dependencies** - pure `fetch` and `crypto.subtle`, works everywhere
- **Isomorphic** - Node 18+, Edge runtimes (Vercel, Cloudflare Workers), browsers
- **ESM + CJS** dual build with full TypeScript types
- **Auto-retry** with exponential backoff and `Retry-After` support
- **Typed errors** - structured BSE error codes, retry flags, rate limit info

---

## Installation

```bash
npm install babysea
# or
pnpm add babysea
# or
yarn add babysea
```

---

## Quick Start

```ts
import { BabySea } from 'babysea';

const client = new BabySea({
  apiKey: 'bye_...',
  region: 'us',
});

// Preview cost before generating
const est = await client.estimate('bfl/flux-schnell', 2);
console.log(est.data.credit_balance_can_afford); // true
console.log(est.data.cost_total_consumed);       // 0.008

// Generate an image
const result = await client.generate('bfl/flux-schnell', {
  generation_prompt: 'A cute baby seal on the beach at golden hour',
  generation_ratio: '16:9',
  generation_output_format: 'png',
  generation_output_number: 1,
});

console.log(result.data.generation_id);
// → "550e8400-e29b-41d4-a716-446655440000"
```

> Generations are async - you receive a `generation_id` immediately. Use `getGeneration()` or webhooks to handle completion.

---

## Configuration

```ts
const client = new BabySea({
  /** API key (required). Create one in your BabySea dashboard. */
  apiKey: 'bye_...',

  /**
   * Region endpoint.
   * - 'us' → https://api.us.babysea.ai  (default)
   * - 'eu' → https://api.eu.babysea.ai
   */
  region: 'us',

  /**
   * Defaults to 'us' when omitted.
   * Override the base URL entirely.
   * Takes precedence over `region`.
   */
  baseUrl: 'https://acme.api.us.babysea.ai',

  /** Request timeout in milliseconds. Default: 30 000 (30s). */
  timeout: 30_000,

  /** Max automatic retries on retryable API errors. Default: 2. */
  maxRetries: 2,
});
```

---

## Methods

### `generate(model, params)` - Create an image generation

```ts
const result = await client.generate('bfl/flux-schnell', {
  // Required
  generation_prompt: 'A serene Japanese garden in spring',

  // Optional
  generation_ratio: '16:9',            // '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  generation_output_format: 'png',    // 'png' | 'jpg' | 'webp'
  generation_output_number: 1,         // number of output images
  generation_input_file: [             // input image URLs (for img2img models)
    'https://example.com/reference.jpg',
  ],
  generation_provider_order: 'replicate, fal', // optional, model-dependent default
});

const { generation_id, generation_provider_order } = result.data;
```

---

### `generateVideo(model, params)` - Create a video generation

```ts
// Duration-only video model
const result = await client.generateVideo('google/veo-2', {
  // Required
  generation_prompt: 'A baby seal swimming in the ocean',
  generation_duration: 5, // seconds (range varies per model)

  // Optional
  generation_ratio: '16:9',
  generation_output_format: 'mp4',
  generation_input_file: [
    'https://example.com/reference.jpg',
  ],
  generation_provider_order: 'replicate, fal',
});

// Duration + resolution video model
const hd = await client.generateVideo('bytedance/seedance-1-pro', {
  generation_prompt: 'Cinematic drone shot over a coral reef',
  generation_duration: 8,
  generation_resolution: '1080p', // required for resolution-priced models
  generation_ratio: '16:9',
});

// Audio-priced video model
const audio = await client.generateVideo('bytedance/seedance-1.5-pro', {
  generation_prompt: 'A music video with rhythmic visuals',
  generation_duration: 5,
  generation_generate_audio: true, // required for audio-priced models
  generation_ratio: '16:9',
});

const { generation_id, generation_provider_order } = result.data;
```

---

### `estimate(model, options?)` - Preview cost before generating

```ts
// Image model - estimate 5 generations
const est = await client.estimate('bfl/flux-schnell', { count: 5 });

est.data.cost_per_generation;       // 0.004 credits
est.data.cost_total_consumed;       // 0.020 credits
est.data.credit_balance;            // 10.000
est.data.credit_balance_can_afford;  // true
est.data.credit_balance_max_affordable; // 196

// Video model - estimate with duration
const vid = await client.estimate('google/veo-2', { duration: 8 });

// Resolution-priced video model - estimate with duration + resolution
const hd = await client.estimate('bytedance/seedance-1-pro', {
  duration: 8,
  resolution: '1080p',
});

// Audio-priced video model - estimate with/without audio
const withAudio = await client.estimate('bytedance/seedance-1.5-pro', {
  duration: 5,
  audio: true,
});
const noAudio = await client.estimate('bytedance/seedance-1.5-pro', {
  duration: 5,
  audio: false,
});

// Shorthand (backwards-compatible): estimate(model, count)
const short = await client.estimate('bfl/flux-schnell', 5);
```

---

### `getGeneration(id)` - Fetch a single generation

```ts
const gen = await client.getGeneration('550e8400-e29b-41d4-a716-446655440000');

gen.data.generation_status;       // 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
gen.data.generation_output_file;  // string[] of output URLs (when succeeded)
```

---

### `listGenerations(options?)` - List with pagination

```ts
const page = await client.listGenerations({ limit: 20, offset: 0 });

page.total;            // total count across all pages
page.data.generations; // Generation[]
```

---

### `cancelGeneration(id)` - Cancel an in-progress generation

```ts
const cancel = await client.cancelGeneration('550e8400-e29b-41d4-a716-446655440000');

cancel.data.generation_status;    // 'canceled'
cancel.data.credits_refunded;     // true
cancel.data.provider_cancel_sent; // true (best-effort signal to provider)
```

> Only available while status is `pending` or `processing`. Sends a cancel signal to the upstream provider (best-effort) and refunds credits.

---

### `deleteGeneration(id)` - Delete a generation and its files

```ts
const del = await client.deleteGeneration('550e8400-e29b-41d4-a716-446655440000');

del.data.files_deleted; // number of storage files removed
```

---

### `status()` - Verify API key and connectivity

```ts
const s = await client.status();

s.data.account_id;
s.data.apikey_prefix;       // 'bye_abc...'
s.data.apikey_last_used_at;
s.data.apikey_expires_at;
```

---

### `account()` - Account details

```ts
const acct = await client.account();

acct.data.account_name;
acct.data.account_email;
acct.data.account_is_personal;
```

---

### `billing()` - Credit balance and subscription

```ts
const bill = await client.billing();

bill.data.billing_credit_balance;    // 42.500
bill.data.billing_plan;              // 'Scale'
bill.data.billing_period_ends_at;
```

---

### `usage(days?)` - Usage analytics

```ts
const u = await client.usage(30); // last 30 days (1–90)

u.data.usage_total_generations;
u.data.usage_total_estimated_cost;
u.data.usage_providers; // per-provider submission breakdown
u.data.usage_endpoints; // per-endpoint request breakdown
```

---

### `health.*` - Infrastructure health

```ts
// Provider circuit breaker state
const prov = await client.health.providers();
prov.data.providers;
// [{ provider: 'replicate', status: 'healthy', failure_rate: 0.01, window: {...} }, ...]

// Model availability across inference providers
const healthModels = await client.health.models();
healthModels.data.models.forEach((m) => {
  console.log(m.model_identifier, m.model_pricing);
});

// Redis cache latency
const cache = await client.health.cache();
cache.data.latency_ms;

// Supabase storage latency
const storage = await client.health.storage();
storage.data.latency_ms;
```

---

### `library.*` - Model and provider catalog

```ts
// All available models (image + video) with pricing and input schemas
const models = await client.library.models();
models.data.models.forEach((m) => {
  // Flat pricing (image + some video models)
  // m.model_pricing → number

  // Resolution-based pricing (some video models)
  // m.model_pricing → { "480p": 0.030, "720p": 0.062, "1080p": 0.166 }

  if (typeof m.model_pricing === 'number') {
    console.log(m.model_identifier, m.model_pricing);
  } else {
    console.log(m.model_identifier, m.model_pricing); // per-resolution map
  }
});

// All provider integration details
const providers = await client.library.providers();
```

---

## Error Handling

```ts
import { BabySea, BabySeaError, BabySeaTimeoutError, BabySeaRetryError } from 'babysea';

try {
  await client.generate('bfl/flux-schnell', {
    generation_prompt: 'A rainy city street',
  });
} catch (err) {
  if (err instanceof BabySeaError) {
    console.error(err.code);      // 'BSE1004' - structured error code
    console.error(err.type);      // 'insufficient_credits'
    console.error(err.message);   // human-readable
    console.error(err.status);    // HTTP status (402, 429, 5xx...)
    console.error(err.retryable); // boolean - safe to retry?
    console.error(err.requestId); // unique ID for support

    // Present on 429 responses
    if (err.rateLimit) {
      console.error(err.rateLimit.remaining);  // requests left in window
      console.error(err.rateLimit.retryAfter); // seconds until reset
    }
  }

  if (err instanceof BabySeaTimeoutError) {
    // Request exceeded the configured `timeout`
  }

  if (err instanceof BabySeaRetryError) {
    // All retry attempts exhausted
    console.error(err.attempts);  // number of attempts made
    console.error(err.lastError); // the final BabySeaError
  }
}
```

---

## Webhooks

Receive real-time generation events on your server. BabySea signs every delivery with HMAC-SHA256 (Stripe-style `t=<ts>,v1=<hex>`).

```ts
import { verifyWebhook } from 'babysea/webhooks';

// Next.js App Router
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('X-BabySea-Signature') ?? '';

  let payload;
  try {
    payload = await verifyWebhook(
      rawBody,
      signature,
      process.env.BABYSEA_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (payload.webhook_event) {
    case 'generation.completed':
      const urls = payload.webhook_data.generation_output_file;
      // urls → string[] of output file URLs
      await saveToDatabase(payload.webhook_data.generation_id, urls);
      break;

    case 'generation.failed':
      console.error(payload.webhook_data.generation_error);
      break;

    case 'generation.canceled':
      // credits were automatically refunded
      break;
  }

  return new Response('OK');
}
```

### Webhook Events

| Event | When |
|---|---|
| `generation.started` | Generation accepted, provider called |
| `generation.completed` | Provider succeeded, output files available |
| `generation.failed` | All providers failed or infrastructure error |
| `generation.canceled` | Canceled by user, credits refunded |
| `webhook.test` | Test ping from the dashboard |

---

## API Key Scopes

BabySea supports scoped API keys - issue a read-only key for your analytics dashboard, a generate-only key for your backend, and a full-access key for internal tools.

| Scope | Routes |
|---|---|
| `generation:write` | POST `/v1/generate/image/:model`, POST `/v1/generate/video/:model` |
| `generation:read` | GET `/v1/content/:generationId`, GET `/v1/content/list` |
| `generation:delete` | DELETE `/v1/content/:generationId`, POST `/v1/content/generation/cancel/:generationId` |
| `account:read` | GET `/v1/user/account`, `/v1/user/billing`, `/v1/usage`, `/v1/status` |
| `health:read` | GET `/v1/health/*` |
| `library:read` | GET `/v1/library/*`, `/v1/estimate/*` |

**Preset bundles:**

| Preset | Included scopes |
|---|---|
| `full_access` | All scopes |
| `generate_only` | `generation:write`, `generation:read`, `library:read` |
| `read_only` | `generation:read`, `account:read`, `health:read`, `library:read` |
| `monitor_only` | `health:read`, `library:read` |

---

## Response Envelope

All successful responses share this shape:

```ts
interface ApiResponse<T> {
  status: 'success';
  request_id: string; // unique ID - include this when contacting support
  message: string;
  timestamp: string;
  data: T;
}

// Paginated responses add:
interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  limit: number;
  offset: number;
}
```

---

## Rate Limits

Rate limits are enforced by the API and can vary by plan and route.

The SDK surfaces rate-limit metadata through `BabySeaError.rateLimit` when the API includes these headers:

| Header | Description |
| ------ | ----------- |
| `X-RateLimit-Limit` | Maximum requests in the current window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the current window resets |
| `Retry-After` | Seconds to wait before retrying after a `429` |

When a response is retryable, the SDK automatically respects `Retry-After` and retries up to `maxRetries`.

---

## Regions

| Region | Endpoint |
|---|---|
| `us` | `https://api.us.babysea.ai` |
| `eu` | `https://api.eu.babysea.ai` |

Custom base URLs are supported via the `baseUrl` option.

BabySea routes requests across the providers supported by the selected model and current account configuration.

---

## License

MIT
