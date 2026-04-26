# HyperDAG Ecosystem — Repo Responsibility Map

**Status:** v0.1 working draft. **Revisited:** 2026-04-26.

This document defines clean, non-overlapping responsibility boundaries
across the five public-facing HyperDAG ecosystem repos. The map has two
layers: **as-built** (what each repo actually contains today) and
**as-intended** (where each repo will sit when responsibilities settle).
Both are documented honestly — the messy current state is not glossed
over.

The principle: each repo owns one specific layer; layers compose, they
do not overlap. When a contributor asks "where does X live?", this map
gives one answer. Where the as-built and as-intended differ, the doc
says so explicitly so a reader can plan the migration.

---

## Why the layers, in one sentence

Identity (an SBT) → Reputation (a RepID) → Privacy (a ZKP) → Application
(a portal or SDK). Each repo owns one transition, and the transitions
compose into the trust stack.

---

## Layer 1 — `hyperdag-protocol`

- **Owns (intended):** Protocol specification, EIP-style spec docs,
  ecosystem governance, the canonical mathematical foundations
  (Pythagorean Comma, scoring formulas, BFT thresholds).
- **Owns (today):** `README.md` (high-level architecture pitch),
  `METHODOLOGY.md` (mathematical foundations), `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `docs/CUSTODIAN_ACCOUNTABILITY.md`,
  `docs/ECOSYSTEM-MAP.md` (this doc), `docs/CROSS-REPO-RECONCILIATION-
  2026-04-26.md`, `spec/SBT-MINTING-FLOW.md` (added this sprint).
- **Does NOT own:** Implementation code, contracts, SDKs.
  Implementation lives in dedicated repos.
- **Public interface:** `spec/*` documents, `README.md`, `CONTRIBUTING.md`.
- **Depends on:** Nothing. This is the top-level spec.
- **Gap (as-built vs as-intended):** Empty `packages/` workspace
  declared but unused. Nx is scaffolded but no Nx tasks defined. Either
  populate the workspace with sub-packages or remove the workspace
  declaration.

---

## Layer 2 — `hyperdag-core`

- **Owns (intended):** Reference implementation of HyperDAG cryptographic
  primitives — Merkle DAG construction, Plonky3 ZKP circuits, hash chain
  audit anchoring.
- **Owns (today):** `services/zkp-postcard/` (a single Rust service with
  one circuit), `docs/BENCHMARK_RESULTS.md`,
  `docs/CUSTODIAN_ACCOUNTABILITY.md`, `METHODOLOGY.md`,
  `create_issues.{js,ps1}` (issue-creation scripts).
- **Does NOT own:** Application logic, agent orchestration, RepID-
  specific scoring. The Rust service is a *prover*, not a *scorer*.
- **Public interface (today):** Rust service binary built from
  `services/zkp-postcard/`. No top-level Cargo.toml; the repo is a
  monorepo of services, not a single crate.
- **Depends on:** `hyperdag-protocol` (for spec), Plonky3 (external).
- **Gap (as-built vs as-intended):** README implies a single Rust crate
  for Merkle DAG + Plonky3. As-built, only zkp-postcard exists. The
  Merkle DAG primitives are conceptually here but not implemented in
  any visible source file. Either ship the Merkle DAG primitives as a
  second crate or move that claim to `spec/` in hyperdag-protocol.

---

## Layer 3 — `trinity-symphony-shared`

- **Owns (intended):** Shared TypeScript types, BFT primitives, and
  constitutional-agent base classes for the multi-agent Trinity
  Symphony architecture.
- **Owns (today):** A heterogeneous mix of agent-coordination
  scaffolding — per-agent README directories under `agents/`, the
  `apm/` JS package, top-level Python files (`conductor.py`,
  `trinity_conductor.py`, `arpo_symphony.py`), n8n automation backups,
  competitive-intelligence scratch files, blueprints, status reports.
  No top-level package.json. No exported npm shape.
- **Does NOT own (intended):** Agent runtime, individual agent logic,
  deployment.
- **Public interface (intended):** npm package
  `@hyperdag/trinity-symphony-shared`.
- **Public interface (today):** None — repo is not currently published
  as an npm package.
- **Depends on:** `hyperdag-protocol` (spec); `hyperdag-core` when ZKP
  is wired in.
- **Gap (as-built vs as-intended):** Largest gap of any repo. The
  intent is "shared types library"; the reality is a workspace
  containing scratch work, agent metadata, and competitive analysis.
  A future sprint should restructure: extract clean shared-types into
  a publishable package, move ops/coordination/competitive content
  elsewhere (probably a private repo).

---

## Layer 4 — `repid`

- **Owns (intended in user instructions):** RepID protocol — earned and
  perceived scoring math, weight definitions, EIP draft for ERC-8004
  extension.
- **Owns (today):** A Next.js 16 application that serves
  [repid.dev](https://repid.dev) — the anonymous human portal where
  users obtain DBT and grow their RepID. `lib/engine.ts` exports
  user-facing tier names, milestones, and copy strings. Reads from
  `process.env.NEXT_PUBLIC_REPID_ENGINE_URL` to query the private
  scoring engine.
- **Owns (added this sprint):** `spec/ZKP-REPID-PROOF.md` and
  `spec/AGENT-STAKING-CHALLENGE-PROTOCOL.md`. The `spec/` folder lives
  alongside Next.js's app/ directory; Next.js ignores it.
- **Does NOT own:** RepID client SDK, RepID contracts, RepID UI for
  agent operators (that's trustrepid).
- **Public interface (today):** Live web app at repid.dev.
- **Depends on:** Private `repid-engine` (Railway), `hyperdag-protocol`
  (for the canonical scoring math), `hyperdag-core` (for ZKP).
- **Gap (as-built vs as-intended):** The user instructions place
  protocol math ownership here, but as-built the math lives in
  `hyperdag-protocol/METHODOLOGY.md`. The two specs added this sprint
  are the right shape for "RepID protocol" content; the rest of the
  protocol math should remain in hyperdag-protocol unless a future
  sprint explicitly migrates it.

---

## Layer 5 — `trustrepid`

- **Owns (intended in user instructions):** TrustRails-branded RepID
  public components — npm SDK for clients, audit log primitives,
  public dashboard components.
- **Owns (today):** A Next.js 16 application that serves
  [trustrepid.dev](https://trustrepid.dev) — the agent dashboard,
  challenge arena, and (per README) marketplace surface. Same
  package.json shape as repid (`private: true`, next/react/supabase,
  not publishable).
- **Owns (added this sprint):** `src/index.ts` defining the
  `TrustRepIDClient` interface (documentation-of-intent only;
  package.json stays `private: true`); `docs/USAGE.md` showing intended
  developer usage.
- **Does NOT own:** Internal trading logic (lives in `trusttrader`),
  x402 payment routing internals, internal analytics dashboards.
- **Public interface (today):** Live web app at trustrepid.dev. No npm
  package.
- **Public interface (intended):** npm package
  `@trustrails/trustrepid-sdk` (or `@hyperdag/trustshell`, per the
  conflicting framings in the two READMEs).
- **Depends on:** `repid` (for protocol math, once the math migrates),
  `trinity-symphony-shared` (for agent types, once that repo
  stabilises).
- **Gap (as-built vs as-intended):** trustrepid README publishes
  TypeScript code examples (`trustshell.gate(...)`,
  `trustshell.gatedPayment(...)`) that imply an installable npm package
  exists. **No such package exists today.** Either:
  - extract the SDK to a publishable package shape (probably new repo
    or new top-level workspace within this repo), or
  - rewrite the README to be honest about the SDK being "in design".

---

## Cross-cutting principles

The five repos compose like this:

```
hyperdag-protocol (spec)
        │
        ├── hyperdag-core (Rust impl)
        │       └── zkp-postcard service
        │
        ├── trinity-symphony-shared (shared TS types — intended)
        │
        ├── repid (human portal — Next.js)
        │
        └── trustrepid (agent dashboard + SDK — Next.js + TS)
```

Direction of dependency arrows: spec is ground truth. Implementation
repos cite the spec; they do not redefine it. Application repos cite
implementation repos; they do not duplicate the math.

When a number (e.g. dissonance veto threshold) appears in two repos,
exactly one is canonical. The canonical home is `hyperdag-protocol/
METHODOLOGY.md`. All other appearances should cross-link, not redefine.
See `CROSS-REPO-RECONCILIATION-2026-04-26.md` for current divergences.

## What this map deliberately does NOT cover

- Private repos (`repid-engine`, the various closed-source agent runtimes,
  internal analytics).
- Out-of-scope public references in the existing READMEs
  (`trinity-ecosystem`, `hyperdag-platform`) — those are mentioned in the
  audit but not given layers here. Future sprints may either bring them
  into this map or remove them from the public READMEs.
- Marketplace, MACI governance, mirror mode — these are application-
  layer features built on top of the five layers, not layers themselves.
