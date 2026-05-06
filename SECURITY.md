# Security policy

## Reporting vulnerabilities

Please report suspected vulnerabilities privately to [dev@babysea.ai](mailto:dev@babysea.ai). Do not open public issues for secrets, authentication bypasses, webhook verification issues, scoped-key bypasses, or request-signing problems.

Include:

- affected SDK version
- runtime environment
- reproduction steps
- expected and actual behavior
- impact assessment

## SDK security boundaries

- Keep full-access API keys server-side.
- Use scoped keys for browser, read-only, monitoring, or generate-only flows.
- Verify BabySea webhooks with the raw request body and `X-BabySea-Signature`.
- Store webhook secrets and API keys in deployment secrets, not in source code.
- Use `Idempotency-Key` for generation writes that may be retried.
- Log `request_id`, structured error code, and retryability metadata instead of prompts, secret URLs, API keys, or webhook secrets.

## Supported versions

Security fixes target the latest published `babysea` SDK version. Upgrade promptly when security releases are published.
