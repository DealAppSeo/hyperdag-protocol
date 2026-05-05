# Changelog

All notable changes to HyperDAG Protocol will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-alpha.1] — 2026-05-04

### Added
- Modular trust kernel architecture with six composition interfaces.
- `@hyperdag/interfaces` package: `IIdentity`, `IReputation`, `IValidation`,
  `IPayment`, `ILinkage`, `IHallucination` — TypeScript interface contracts
  with full TSDoc and shared types under `src/types/`.
- `@hyperdag/identity-erc8004` — default ERC-8004 IdentityRegistry client.
- `@hyperdag/reputation-zkp` — default ZKP RepID scoring service client.
- `@hyperdag/validation-trinity` — default Trinity Symphony BFT validators
  with HITL graduation via `repIdGate` parameter and Pythagorean Comma
  veto override.
- `@hyperdag/payment-x402` — default x402 envelope construction and
  `X-PAYMENT` parsing with injectable verifier.
- `@hyperdag/linkage-registry` — default in-memory linkage registry stub
  with inverse-stake curve.
- `@hyperdag/hallucination-hal` — default HAL service client with
  clearly-marked stub fallback for local development.
- `@hyperdag/protocol` meta-package with `createHDP({ ... })` factory
  composing the curated defaults with sensible defaults.
- [ARCHITECTURE.md](ARCHITECTURE.md) naming the six architectural
  principles (Adaptive, Antifragile, Recursive, HITL Graduating, ZKP
  Federated Learning with Bilateral Benefit, Hybrid Telegram + PWA).
- [GOVERNANCE_ROADMAP.md](GOVERNANCE_ROADMAP.md) with bootstrap-to-community
  timeline (months 0/3/6/12/18/24) and three-branch DAO long-term vision.
- GitHub issue templates (bug, feature, security pointer) and pull request
  template.
- This `CHANGELOG.md`.

### Changed
- `README.md` restructured: removed two redundant ecosystem listings
  (Infrastructure Repos table and Related Projects bullet list); added
  Quick Start, Modular Trust Kernel, and Phased Release Plan sections;
  updated Ideas Being Built table to use GitHub repo links instead of
  `.dev` commercial domains.
- Root `package.json` `workspaces` extended to include `packages/defaults/*`
  so npm workspaces creates symlinks for the six default packages.

### Notes
- First public alpha release. Interface shapes are subject to refinement
  based on early-adopter feedback before v0.1.0 final. The 12-month
  backward-compat guarantee starts at v0.1.0 final, not at the alphas.
- Reputation and HAL defaults are thin clients over proprietary scoring
  services (P-001 and P-003 patent claims). The published packages do NOT
  redistribute the scoring formulas. Conforming third-party implementations
  are free to use any scoring approach.

[Unreleased]: https://github.com/DealAppSeo/hyperdag-protocol/compare/v0.1.0-alpha.1...HEAD
[0.1.0-alpha.1]: https://github.com/DealAppSeo/hyperdag-protocol/releases/tag/v0.1.0-alpha.1
