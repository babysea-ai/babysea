<div align="center">

# 🌊 babysea

**Open source TypeScript SDK for the BabySea execution control plane for generative media.<br/>
One API, one schema, one lifecycle across image and video inference providers.**

<br/>

[![Open Source](https://img.shields.io/badge/open%20source-BabySea-48d1cc.svg)](https://babysea.ai)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production-2ea44f.svg)](#status)
[![npm version](https://img.shields.io/npm/v/babysea.svg?color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/babysea)

<br/>

**Runtime**

[![Browser](https://img.shields.io/badge/runtime-Browser-4285F4.svg)](#configuration)
[![Edge](https://img.shields.io/badge/runtime-Edge-000000.svg)](#configuration)
[![Node.js](https://img.shields.io/badge/runtime-Node.js%2018%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/en/about/previous-releases)
[![TypeScript](https://img.shields.io/badge/sdk-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Zero dependencies](https://img.shields.io/badge/dependencies-zero-48d1cc.svg)](#runtime-contract)

<br/>

_Works across Node.js, Edge runtimes (Vercel, Cloudflare Workers), and browsers._

</div>

## What this is

`babysea` is the TypeScript SDK for BabySea's execution control plane. It gives applications a single typed entry point into generative media execution: send a workload, receive a generation id, and react to lifecycle events.

BabySea standardizes how image and video workloads run across inference providers. Provider selection, failover, billing, and observability are managed by the platform; provider selection adapts over time based on real execution outcomes.

80+ image and video models. 12+ AI labs. 8+ inference providers. 3 sovereign regions. One contract.

## Why this exists

Building generative media products is not just about calling models.

In production, teams have to deal with:

- different provider APIs
- different model schemas
- async job handling
- retries and timeouts
- failover across providers
- webhook verification
- cost estimation before execution
- providers that drift in latency, cost, and quality from week to week

As more providers and models emerge, these differences compound, making production behavior increasingly hard to manage by hand.

BabySea turns inconsistent provider behavior into a predictable execution system.

The SDK gives you:

- unified schema across 80+ models from 12+ AI labs and 8+ inference providers
- async execution with full generation lifecycle control
- automatic retries, timeouts, and cross-provider failover
- webhook verification for event-driven completion
- cost estimation before execution
- health and library endpoints for operational visibility
- zero dependencies, using only `fetch` and `crypto.subtle`

The platform behind the SDK adapts provider selection over time based on real execution outcomes (latency, cost, success rate). You can also pin the order explicitly with `generation_provider_order`.

BabySea treats provider failure as a normal condition and handles it at the system level. Developers define a workload once; the execution control plane decides how to run it.

## Runtime contract

| Layer               | SDK surface                                                              | Runtime responsibility                                                                                        |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Workload submission | `generate(model, params, options?)`                                      | Validate input locally where possible, send one normalized request, and return the generation id immediately. |
| Cost preview        | `estimate(model, options?)`                                              | Ask the API for model-aware credit estimates before execution.                                                |
| Lifecycle reads     | `getGeneration()`, `listGenerations()`, `waitForGeneration()`            | Track async completion without exposing provider-specific polling behavior.                                   |
| Lifecycle control   | `cancelGeneration()`, `deleteGeneration()`                               | Forward cancellation and deletion requests through the BabySea API.                                           |
| Operations          | `status()`, `account()`, `billing()`, `usage()`, `health.*`, `library.*` | Expose account, health, usage, provider, and model catalog data through one typed client.                     |
| Event delivery      | `verifyWebhook()` from `babysea/webhooks`                                | Verify HMAC-signed webhook payloads before processing generation events.                                      |

No provider SDK, queue client, storage client, or framework adapter is required. The package uses only platform `fetch` and `crypto.subtle`.

## What this is not

The SDK is not a model host, provider aggregator, billing engine, or data pipeline. Those responsibilities live in the BabySea execution control plane. The SDK stays intentionally small: it normalizes client calls, signs nothing except webhook verification, retries safe failures, and surfaces structured API responses.

## Open source

This SDK is fully open source under the Apache 2.0 license.

You can:

- use it in commercial projects
- modify and extend it
- contribute improvements
- build your own applications and tooling on top of it

The SDK is open. The BabySea execution control plane remains the service layer behind it.

> **Curious how adaptive provider selection actually works?** The data layer that drives it is open-sourced separately as [`adaptive-island`](https://github.com/babysea-ai/adaptive-island), built on Databricks (Lakeflow + Delta Lake + MLflow + Unity Catalog + Mosaic AI Model Serving).

## Design principle

AI workloads should behave predictably in production, regardless of the underlying provider.

BabySea sits between your application and inference providers as the execution control plane. It normalizes:

- model inputs
- provider differences
- execution lifecycle
- reliability behavior
- event delivery
- cost surface

So developers can focus on building products, not stitching together inference edge cases.

## Installation

```bash
npm install babysea
# or
pnpm add babysea
# or
yarn add babysea
```

## Quick start

> New accounts receive **$1 in free credits** on signup, enough for ~100-330 test generations depending on the model. No credit card required.

```ts
import { BabySea } from 'babysea';

const client = new BabySea({
  apiKey: 'bye_...',
  region: 'us',
});

// Preview cost before generating
const est = await client.estimate('bfl/flux-schnell', 2);
console.log(est.data.credit_balance_can_afford); // true
console.log(est.data.cost_total_consumed); // 0.008

// Generate an image
const result = await client.generate('bfl/flux-schnell', {
  generation_prompt: 'A baby seal plays in Arctic',
  generation_ratio: '16:9',
  generation_output_format: 'png',
  generation_output_number: 1,
});

console.log(result.data.generation_id);
// ➜ "550e8400-e29b-41d4-a716-446655440000"
```

> Generations are async - you receive a `generation_id` immediately. Use `getGeneration()` or webhooks to handle completion.

## Models & Pricing

The full model catalog, per-model pricing, and per-model input schemas are
published on babysea.ai. They are the source of truth for what each model
accepts and how much each generation costs.

| Page                                                         | What you get                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [babysea.ai/model-pricing](https://babysea.ai/model-pricing) | Credits per generation for every image model, per-second/per-resolution/audio pricing for video models, with the BabySea credit-to-USD rate.     |
| [babysea.ai/model-schema](https://babysea.ai/model-schema)   | Full input schema per model: prompt, ratios, output formats, durations, resolutions, audio, supported provider stack, and runnable code samples. |
| [babysea.ai/pricing-plan](https://babysea.ai/pricing-plan)   | Subscription plans, included credits, rate limits, and SLAs.                                                                                     |

The same data is also available programmatically:

```ts
const { data } = await client.library.models();
// data.models[].model_pricing      ➜ number | Record<resolution, number>
// data.models[].model_supported_provider
// data.models[].schema              ➜ input fields accepted by the model
```

And you can preview cost for a specific request before executing it with
[`client.estimate()`](#estimatemodel-options---preview-cost-before-generating).

## Configuration

```ts
const client = new BabySea({
  /** API key (required). Create one in your BabySea dashboard. */
  apiKey: 'bye_...',

  /**
   * Region endpoint.
   * - 'us' ➜ https://api.us.babysea.ai  (default)
   * - 'eu' ➜ https://api.eu.babysea.ai
   * - 'jp' ➜ https://api.jp.babysea.ai (APAC)
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

## Methods

### `generate(model, params, options?)` - Create an image generation

```ts
const result = await client.generate('bfl/flux-schnell', {
  // Required
  generation_prompt: 'A serene Japanese garden in spring',

  // Optional
  generation_ratio: '16:9', // '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  generation_output_format: 'png', // 'png' | 'jpg' | 'webp'
  generation_output_number: 1, // number of output images
  generation_input_file: [
    // input image URLs (for img2img models)
    'https://example.com/reference.jpg',
  ],
  generation_provider_order: 'fastest', // default: predictive router picks the best provider per region
});

const { generation_id, generation_provider_order } = result.data;
```

> Pass `'fastest'` (the default for every multi-provider model) to let
> BabySea's predictive router select the provider at request time based
> on real execution outcomes. Pass an explicit string like
> `'replicate, fal'` to pin the failover order yourself.

#### Idempotency (recommended for production)

Pass an `Idempotency-Key` so retries replay the original response instead of creating duplicate generations:

```ts
import { randomUUID } from 'node:crypto';

const idempotencyKey = randomUUID();

const created = await client.generate(
  'bfl/flux-schnell',
  { generation_prompt: 'A baby seal plays in Arctic' },
  { idempotencyKey },
);

if (created.idempotency_replayed) {
  // Server replayed the original response from the idempotency cache.
}
```

- Keys are valid for 24 h.
- Replaying with a **different** body returns `BSE2015`.
- Replaying while the original is still processing returns `BSE2016`.
- Format: 1-255 chars, `[A-Za-z0-9_\-:.]`. UUIDs are a good default.

### `generate(model, params)` - Create a video generation

```ts
// Duration-only video model
const result = await client.generate('google/veo-2', {
  // Required
  generation_prompt: 'A baby seal plays in Arctic',
  generation_duration: 5, // seconds (range varies per model)

  // Optional
  generation_ratio: '16:9',
  generation_output_format: 'mp4',
  generation_input_file: ['https://example.com/reference.jpg'],
  generation_provider_order: 'fastest',
});

// Duration + resolution video model
const hd = await client.generate('bytedance/seedance-1-pro', {
  generation_prompt: 'Cinematic drone shot over a coral reef',
  generation_duration: 8,
  generation_resolution: '1080p', // required for resolution-priced models
  generation_ratio: '16:9',
});

// Audio-priced video model
const audio = await client.generate('bytedance/seedance-1.5-pro', {
  generation_prompt: 'A music video with rhythmic visuals',
  generation_duration: 5,
  generation_generate_audio: true, // required for audio-priced models
  generation_ratio: '16:9',
});

const { generation_id, generation_provider_order } = result.data;
```

### `estimate(model, options?)` - Preview cost before generating

```ts
// Image model - estimate 5 generations
const est = await client.estimate('bfl/flux-schnell', { count: 5 });

est.data.cost_per_generation; // 0.004 credits
est.data.cost_total_consumed; // 0.020 credits
est.data.credit_balance; // 10.000
est.data.credit_balance_can_afford; // true
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

### `getGeneration(id)` - Fetch a single generation

```ts
const gen = await client.getGeneration('550e8400-e29b-41d4-a716-446655440000');

gen.data.generation_status; // 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
gen.data.generation_output_file; // string[] of output URLs (when succeeded)
```

### `listGenerations(options?)` - List with pagination

```ts
const page = await client.listGenerations({ limit: 20, offset: 0 });

page.total; // total count across all pages
page.data.generations; // Generation[]
```

### `cancelGeneration(id)` - Cancel an in-progress generation

```ts
const cancel = await client.cancelGeneration(
  '550e8400-e29b-41d4-a716-446655440000',
);

cancel.data.generation_status; // 'canceled'
cancel.data.credits_refunded; // true
cancel.data.provider_cancel_sent; // true (best-effort signal to provider)
```

> Only available while status is `pending` or `processing`. Sends a cancel signal to the upstream provider (best-effort) and refunds credits.

### `deleteGeneration(id)` - Delete a generation and its files

```ts
const del = await client.deleteGeneration(
  '550e8400-e29b-41d4-a716-446655440000',
);

del.data.files_deleted; // number of storage files removed
```

### `status()` - Verify API key and connectivity

```ts
const s = await client.status();

s.data.account_id;
s.data.apikey_prefix; // 'bye_abc...'
s.data.apikey_last_used_at;
s.data.apikey_expires_at;
```

### `account()` - Account details

```ts
const acct = await client.account();

acct.data.account_name;
acct.data.account_email;
acct.data.account_is_personal;
```

### `billing()` - Credit balance and subscription

```ts
const bill = await client.billing();

bill.data.billing_credit_balance; // 42.500
bill.data.billing_plan; // 'Scale'
bill.data.billing_period_ends_at;
```

### `usage(days?)` - Usage analytics

```ts
const u = await client.usage(30); // last 30 days (1-90)

u.data.usage_total_generations;
u.data.usage_total_estimated_cost;
u.data.usage_providers; // per-provider submission breakdown
u.data.usage_endpoints; // per-endpoint request breakdown
```

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

### `library.*` - Model and provider catalog

```ts
// All available models (image + video) with pricing and input schemas
const models = await client.library.models();
models.data.models.forEach((m) => {
  // Flat pricing (image + some video models)
  // m.model_pricing ➜ number

  // Resolution-based pricing (some video models)
  // m.model_pricing ➜ { "480p": 0.030, "720p": 0.062, "1080p": 0.166 }

  if (typeof m.model_pricing === 'number') {
    console.log(m.model_identifier, m.model_pricing);
  } else {
    console.log(m.model_identifier, m.model_pricing); // per-resolution map
  }
});

// All provider integration details
const providers = await client.library.providers();
```

## Error Handling

```ts
import {
  BabySea,
  BabySeaError,
  BabySeaRetryError,
  BabySeaTimeoutError,
} from 'babysea';

try {
  await client.generate('bfl/flux-schnell', {
    generation_prompt: 'A rainy city street',
  });
} catch (err) {
  if (err instanceof BabySeaError) {
    console.error(err.code); // 'BSE1004' - structured error code
    console.error(err.type); // 'insufficient_credits'
    console.error(err.message); // human-readable
    console.error(err.status); // HTTP status (402, 429, 5xx...)
    console.error(err.retryable); // boolean - safe to retry?
    console.error(err.requestId); // unique ID for support

    // Present on 429 responses
    if (err.rateLimit) {
      console.error(err.rateLimit.remaining); // requests left in window
      console.error(err.rateLimit.retryAfter); // seconds until reset
    }
  }

  if (err instanceof BabySeaTimeoutError) {
    // Request exceeded the configured `timeout`
  }

  if (err instanceof BabySeaRetryError) {
    // All retry attempts exhausted
    console.error(err.attempts); // number of attempts made
    console.error(err.lastError); // the final BabySeaError
  }
}
```

## Webhooks

Receive real-time generation events on your server. BabySea signs every delivery with HMAC-SHA256 (`t=<ts>,v1=<hex>`).

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
      // urls ➜ string[] of output file URLs
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

| Event                  | When                                         |
| ---------------------- | -------------------------------------------- |
| `generation.started`   | Generation accepted, provider called         |
| `generation.completed` | Provider succeeded, output files available   |
| `generation.failed`    | All providers failed or infrastructure error |
| `generation.canceled`  | Canceled by user, credits refunded           |
| `credits.low_balance`  | Credit balance crossed an alert threshold    |
| `webhook.test`         | Test ping from the dashboard                 |

## API Key Scopes

BabySea supports scoped API keys - issue a read-only key for your analytics dashboard, a generate-only key for your backend, and a full-access key for internal tools.

| Scope               | Routes                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- |
| `generation:write`  | POST `/v1/generate/image/:model`, POST `/v1/generate/video/:model`                     |
| `generation:read`   | GET `/v1/content/:generationId`, GET `/v1/content/list`                                |
| `generation:delete` | DELETE `/v1/content/:generationId`, POST `/v1/content/generation/cancel/:generationId` |
| `account:read`      | GET `/v1/user/account`, `/v1/user/billing`, `/v1/usage`, `/v1/status`                  |
| `health:read`       | GET `/v1/health/*`                                                                     |
| `library:read`      | GET `/v1/library/*`, `/v1/estimate/*`                                                  |

**Preset bundles:**

| Preset          | Included scopes                                                  |
| --------------- | ---------------------------------------------------------------- |
| `full_access`   | All scopes                                                       |
| `generate_only` | `generation:write`, `generation:read`, `library:read`            |
| `read_only`     | `generation:read`, `account:read`, `health:read`, `library:read` |
| `monitor_only`  | `health:read`, `library:read`                                    |

## Response Envelope

All successful responses share this shape:

```ts
interface ApiResponse<T> {
  status: 'success';
  request_id: string; // unique ID - include this when contacting support
  message: string;
  timestamp: string;
  data: T;
  /**
   * Set by the SDK when the server returned `Idempotency-Replayed: true`,
   * meaning the response was replayed from the idempotency cache rather
   * than newly executed.
   */
  idempotency_replayed?: boolean;
}

// Paginated responses add:
interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  limit: number;
  offset: number;
}
```

## Rate Limits

Rate limits are enforced by the API and can vary by plan and route.

The SDK surfaces rate-limit metadata through `BabySeaError.rateLimit` when the API includes these headers:

| Header                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| `X-RateLimit-Limit`     | Maximum requests in the current window        |
| `X-RateLimit-Remaining` | Requests remaining in the current window      |
| `X-RateLimit-Reset`     | Unix timestamp when the current window resets |
| `Retry-After`           | Seconds to wait before retrying after a `429` |

When a response is retryable, the SDK automatically respects `Retry-After` and retries up to `maxRetries`.

Transient network failures (DNS resolution, connection reset, socket
hangup, undici socket errors) are also retried under the same
`maxRetries` budget. To preserve exactly-once semantics, non-idempotent
methods (`POST`, `PUT`, `PATCH`) are only retried on network failure
when you supply an `Idempotency-Key`.

## SDK Telemetry

Every request carries a small set of diagnostic headers so the platform
can correlate behavior with client versions and runtimes:

| Header                          | Example value                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| `X-BabySea-SDK-Name`            | `babysea-node`                                                        |
| `X-BabySea-SDK-Version`         | `<package-version>`                                                   |
| `X-BabySea-SDK-Runtime`         | `node`/`deno`/`bun`/`workerd`/`edge`/`browser`/`unknown`              |
| `X-BabySea-SDK-Runtime-Version` | `20.11.1` (when known)                                                |
| `User-Agent`                    | `babysea-node/<package-version> (node/20.11.1)` (skipped in browsers) |

No request bodies, prompts, or PII are added by these headers - they
contain only SDK and runtime metadata.

## Regions

| Region | Endpoint                    |
| ------ | --------------------------- |
| `us`   | `https://api.us.babysea.ai` |
| `eu`   | `https://api.eu.babysea.ai` |
| `jp`   | `https://api.jp.babysea.ai` |

Custom base URLs are supported via the `baseUrl` option.

BabySea selects a provider from the set supported by each model and current account configuration. Selection adapts over time based on observed latency, cost, and success rate; you can pin or constrain the order with `generation_provider_order`.

### Supported inference providers

| Provider      | ID             |
| ------------- | -------------- |
| Alibaba Cloud | `alibabacloud` |
| BFL           | `bfl`          |
| BytePlus      | `byteplus`     |
| Cloudflare    | `cloudflare`   |
| FAL           | `fal`          |
| OpenAI        | `openai`       |
| Replicate     | `replicate`    |
| Runway        | `runway`       |

Pass `generation_provider_order: 'fastest'` (default for every
multi-provider model) to let the platform pick. Pass an explicit
ordering string (e.g. `'replicate, fal'`, `'bfl, replicate, cloudflare'`)
to pin failover yourself. Use `client.library.models()` to see the exact
stack each model supports.

## Status

`babysea` is the production TypeScript SDK for BabySea and is published to npm. It targets Node.js 18+, Edge runtimes, and browsers. Release metadata is sourced from package metadata during build; this README does not rely on generated local badge SVGs.

## Contributing

We welcome contributions. Feel free to open issues or submit pull requests on our [GitHub repository](https://github.com/babysea-ai/babysea).

## Resources

### Product

| Page                                                         | Description                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| [docs.babysea.ai](https://docs.babysea.ai)                   | Full documentation: setup, dashboard, API reference, and changelog. |
| [babysea.ai/model-pricing](https://babysea.ai/model-pricing) | Per-model pricing for every image and video model.                  |
| [babysea.ai/model-schema](https://babysea.ai/model-schema)   | Per-model input schema and runnable code samples.                   |
| [babysea.ai/pricing-plan](https://babysea.ai/pricing-plan)   | Subscription plans, included credits, rate limits, SLAs.            |
| [babysea.ai/faq](https://babysea.ai/faq)                     | Frequently asked questions.                                         |
| [babysea.ai/support](https://babysea.ai/support)             | Contact support.                                                    |
| [status.babysea.ai](https://status.babysea.ai)               | Real-time platform status and incident history (US, EU, JP).        |

### Legal & compliance

Use the pages below for procurement, vendor review, and compliance review.
If you need a counter-signed copy of the DPA or the current subprocessor
list for your records, request one from [babysea.ai/support](https://babysea.ai/support).

| Document                                                                        | When you need it                                                               |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Terms of Use](https://babysea.ai/terms-of-use)                                 | Master agreement governing your use of BabySea.                                |
| [API & Inference Terms](https://babysea.ai/api-and-inference)                   | Terms specific to the API, SDK, and inference workloads.                       |
| [Service Level Terms](https://babysea.ai/service-level-terms)                   | Uptime SLA, support response, and credit remedies.                             |
| [Account & Workspace Terms](https://babysea.ai/account-and-workspace)           | Account, workspace, and team-membership terms.                                 |
| [Billing & Credit Terms](https://babysea.ai/billing-and-credit)                 | Credit lifecycle, refunds, plan changes, and invoicing.                        |
| [Privacy Policy](https://babysea.ai/privacy-policy)                             | What we collect, how we use it, your rights.                                   |
| [Data Processing Agreement (DPA)](https://babysea.ai/data-processing-agreement) | GDPR/UK GDPR processor terms. BabySea acts as **processor** for customer data. |
| [List of Subprocessors](https://babysea.ai/list-of-subprocessors)               | Current subprocessors (inference providers, infra, observability).             |
| [Data Sovereignty](https://babysea.ai/data-sovereignty)                         | Where each region stores and processes data (US, EU, JP).                      |
| [Data Lifecycle](https://babysea.ai/data-lifecycle)                             | Retention, deletion, and export of generations and account data.               |
| [Cookies Policy](https://babysea.ai/cookies-policy)                             | Cookies used by babysea.ai.                                                    |
| [AI Principles](https://babysea.ai/ai-principles)                               | Our principles for operating a generative-media control plane.                 |
| [AI Service Terms](https://babysea.ai/ai-service-terms)                         | Acceptable use of generated content.                                           |
| [AI Providers Policy](https://babysea.ai/ai-providers-policy)                   | How upstream providers fit into our service.                                   |
| [Security](https://babysea.ai/security)                                         | Security overview, controls, and disclosure program.                           |
| [Acknowledgments](https://babysea.ai/acknowledgments)                           | Security researchers credited for responsible disclosure.                      |

## License

Apache-2.0
