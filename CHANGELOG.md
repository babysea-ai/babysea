# Changelog

All notable changes to the `babysea` SDK are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.4.1]: https://github.com/babysea-ai/babysea/releases/tag/v1.4.1
[1.4.0]: https://github.com/babysea-ai/babysea/releases/tag/v1.4.0
