# Changelog

All notable changes to the `babysea` SDK are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.2] - 2026-05-01

### Added

- **`'fastest'` provider order sentinel.** `GenerationProviderOrder` now
  includes `'fastest'`, the default for every multi-provider model.
  BabySea's predictive router resolves it at request time from the
  regional Databricks Gold ranking cache (latency, cost, success rate),
  with circuit-breaker and ML re-scoring layered on top. Pass an explicit
  ordering string to bypass adaptive selection and pin the failover stack
  yourself.
- **Full 8-provider `InferenceProvider` union.** Added `'alibabacloud'`
  and `'runway'` so the SDK type surface matches the platform exactly:
  Alibaba Cloud, BFL, BytePlus, Cloudflare, FAL, OpenAI, Replicate, Runway.
- **`GenerationProviderOrder` covers every server-accepted ordering.**
  All 26 strings from `ALL_GENERATION_PROVIDER_ORDERS` are now part of the
  exported union (was: 10). The image and video parameter types share the
  same union instead of redefining a partial copy.
- **SDK telemetry headers.** Every request now sends
  `X-BabySea-SDK-Name`, `X-BabySea-SDK-Version`, `X-BabySea-SDK-Runtime`
  (`node` / `deno` / `bun` / `workerd` / `edge` / `browser` / `unknown`),
  `X-BabySea-SDK-Runtime-Version` (when known), and a Stripe-style
  `User-Agent` (skipped in browsers where it is a forbidden header).
  Helps the platform correlate behavior with client versions and runtimes.
- **Network-level retry.** Transient `fetch` failures (DNS, connection
  reset, socket hangup, undici socket errors) are now retried under the
  same `maxRetries` budget. Non-idempotent methods (`POST`, `PUT`,
  `PATCH`) are only retried when the caller supplied an `Idempotency-Key`,
  preserving exactly-once semantics.
- **Full jitter on retry backoff.** Retry delays now use exponential
  backoff with full jitter to avoid thundering-herd retries during
  upstream incidents.

### Exported

- `InferenceProvider`, `GenerationProviderOrder`,
  `GenerationProviderOrderFastest` are now part of the public type
  surface.

### Maintenance

- No breaking changes. All 1.4.1 call sites compile and run unchanged.

## [1.4.1] - 2026-04-30

### Changed

- Enabled [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
  on every published artifact. Releases are now signed by GitHub Actions and
  the attestation is verifiable on npm.
- Documented the release flow in `CHANGELOG.md` (this file).

### Maintenance

- No public API changes.
- No runtime behavior changes.
- Build, types, and bundle output are byte-identical to 1.4.0 except for the
  version constant.

## [1.4.0] - 2026-04-15

Initial public reference for this changelog. See the [GitHub Releases page](https://github.com/babysea-ai/babysea/releases)
for prior history.

[1.4.2]: https://github.com/babysea-ai/babysea/releases/tag/v1.4.2
[1.4.1]: https://github.com/babysea-ai/babysea/releases/tag/v1.4.1
[1.4.0]: https://github.com/babysea-ai/babysea/releases/tag/v1.4.0
