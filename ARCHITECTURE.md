# HyperDAG Protocol — Architecture

> *"Whatever is true, whatever is noble, whatever is right..." — Philippians 4:8*

This document is the canonical architectural reference for the HyperDAG
Protocol (HDP). It is intentionally high-level: it names what each layer
does and what architectural commitments hold across versions, without
disclosing implementation details that are subject to patent review.

For reproducible quick-start usage, see [`packages/protocol/README.md`](packages/protocol/README.md).
For the bootstrap-to-community governance handover, see [GOVERNANCE_ROADMAP.md](GOVERNANCE_ROADMAP.md).

---

## Mental Model: Nested Containment

HyperDAG Protocol is a **nested-containment trust kernel**. Each layer
contains a smaller, sharper trust guarantee than the layer outside it. The
outermost layer (Identity) only requires that an agent has a name. The
innermost layer (Hallucination) requires that the agent's *output* survives
adversarial cross-LLM consensus.

Each layer is independently composable, independently versioned, and
independently replaceable. You can adopt only the layers you need.

```
┌──────────────────────────────────────────────────────────────┐
│  IIdentity        — Agent-as-NFT (ERC-8004 default)          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  IReputation   — ZKP RepID (verifiable scores)         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  ILinkage   — Human↔agent custodial binding      │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  IPayment — x402 micropayments (settled)   │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  IValidation — BFT validator panel   │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  IHallucination — HAL veto     │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## The Six Layers

| Interface | Default | What it solves | Reference |
| :--- | :--- | :--- | :--- |
| `IIdentity` | `@hyperdag/identity-erc8004` | Stable, transferable agent identity. | [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) |
| `IReputation` | `@hyperdag/reputation-zkp` | Verifiable agent reputation under privacy. | ZKP RepID |
| `IValidation` | `@hyperdag/validation-trinity` | Byzantine-fault-tolerant attestation with HITL graduation. | Trinity Symphony |
| `IPayment` | `@hyperdag/payment-x402` | Cryptographically settled micropayments. | [x402](https://github.com/coinbase/x402) |
| `ILinkage` | `@hyperdag/linkage-registry` | Human↔agent custodial binding under inverse-stake. | HDP Linkage Registry |
| `IHallucination` | `@hyperdag/hallucination-hal` | Adversarial filtering of agent outputs. | HAL (Pythagorean Comma BFT) |

Each interface is documented in detail at its source file under
[`packages/interfaces/src/`](packages/interfaces/src/).

---

## Composition Contract: Interfaces and Curated Defaults

The architectural contract HDP commits to:

1. **Interfaces are versioned independently.** Breaking changes increment the
   major version of `@hyperdag/interfaces`. Compatible third-party
   implementations get a **12-month backward-compat guarantee.**

2. **One curated default per layer** — blessed and supported by the core
   team. Curated defaults are the reference implementations; alternatives
   are welcome and will be linked from this repo when they reach maturity.

3. **Replacement at install time, not runtime.** Composition is set when you
   construct the HDP instance via `createHDP({ overrides: { ... } })`. We
   do not re-route mid-session. Determinism beats cleverness.

4. **Backward compat is contractual.** A conforming implementation that ships
   today will continue to work for at least 12 months without code changes,
   even as new interfaces are added.

5. **Layer interfaces are the IP-defining surface.** Implementations may be
   open-sourced or proprietary. The interfaces themselves are Apache-2.0 and
   will remain so.

---

## Architectural Principles

HDP is governed by six architectural principles. Some are structural in
v0.1 (the parameter or interface point exists). Others are roadmap
commitments visible in this architecture so future contributors understand
the direction.

### 1. Adaptive — HAL ABL/ABI (Always Be Learning, Always Be Improving)

HAL is not static. Every night, HAL uses unused free-tier LLM/SLM compute
to run benchmark validation against public hallucination datasets
(TruthfulQA, HaluEval, NyayaverifyBench). It tests its Pythagorean Comma
threshold against alternatives and produces evidence for tunable
improvements. This is **structural**, not optional — antifragility through
measurable nightly evolution.

In v0.1, the IHallucination interface exposes `getCommaThreshold()` so
downstream consumers can introspect the threshold an implementation operates
under. The nightly improvement loop ships in v0.2–0.5.

### 2. Antifragile — Adversarial Inputs Strengthen the System

HDP doesn't just survive adversarial inputs — it **metabolizes them into
permanent improvement.** Every adversarial test contributes to HAL's
training data; every successful veto teaches the system about a new attack
pattern. Per Nassim Taleb's framework, the system gains from disorder.

In v0.1, the production HAL evaluator already runs at a 99.4% refusal rate
against the 2,600 adversarial financial prompts in the standing benchmark.
Those benchmarks evolve in public — see hyperdag-bench.

### 3. Recursive — Self-Improving Within Bounds

HAL's evaluations of agent outputs become inputs to HAL's own learning.
The validation layer's BFT consensus results inform future threshold
tuning. The system is aware of its own performance and can propose
improvements (which humans approve in v0.1; bounded autonomous tuning is
v0.5+ work).

### 4. HITL Graduating — Autonomy Earned, Not Granted

The IValidation interface accepts a `repIdGate` parameter and routes
artifacts through human review when the submitter's RepID is below the
gate. **Low RepID = mandatory human review.** As RepID grows through
verified work, autonomy graduates. **High RepID = autonomous operation
within bounds.**

This is structural in v0.1: the parameter exists in the interface, and the
default `TrinityValidationProvider` honors it. The exact graduation curve
is tuned in v0.5+ and governed by community vote (see GOVERNANCE_ROADMAP.md).

### 5. ZKP Federated Learning with Bilateral Benefit

This is a v0.2–0.3 commitment. **Users who contribute their (privacy-preserved
via ZKP) data to HAL's training receive a sharper HAL in return. Bilateral
benefit, not extraction.** Paid subscribers and licensees can opt out — they
pay for the privacy of not contributing while still getting full benefit.
This aligns incentives:
- Free users contribute and benefit.
- Paid users sustain the infrastructure and benefit.
- Everyone gets better trust signals.

Architecturally enabled by the IReputation interface's privacy-preserving
design — `getReputationProof()` returns a ZK proof that an agent's score
satisfies a public predicate without revealing the underlying inputs.

### 6. Hybrid Telegram + PWA Interaction Surface

This is a v0.2+ commitment. **The npm package is the developer surface.
The user-facing surface is a hybrid Telegram bot + Progressive Web App at
`app.aitrinitysymphony.com`.** Users see HAL working in real time,
contribute data via simple consent flows, manage their RepID, and see their
federated learning impact.

The PWA was prototyped earlier in 2026; it is being resurrected and
integrated as part of v0.2.

---

## Per-User Adoption Principle

HDP is designed so users adopt only the layers they need. Four common
shapes:

1. **HAL only.** A team building an LLM product wants hallucination
   filtering on top of an existing identity stack. They install
   `@hyperdag/hallucination-hal` and call `evaluate()` on each output.
   Done.

2. **Reputation only.** A marketplace wants verifiable seller scores
   without dictating identity. They install `@hyperdag/reputation-zkp`,
   wire it to their existing identity, and surface the score.

3. **Agent operator.** A team running multiple autonomous agents installs
   `@hyperdag/protocol` and uses the full stack: identity, reputation,
   validation (with HITL graduation), payment, linkage, hallucination.

4. **Multi-stakeholder custodianship.** A regulated environment uses
   `ILinkage` to bind multiple human RepIDs to one agent under shared
   stake — useful for compliance scenarios where no single human is the
   sole responsible party.

---

## Why This Architecture Is Honest

- **Standards stay standards.** HDP wraps ERC-8004; it does not fork it.
  The default `IIdentity` implementation passes through to the canonical
  ERC-8004 IdentityRegistry. If the spec evolves, our default tracks the spec.
- **Open source where it matters.** The interfaces and HAL are Apache-2.0.
  Ship a third-party implementation; it conforms to the same contract our
  defaults conform to.
- **Patents only on novel composition.** Pythagorean Comma BFT veto, the
  inverse-stake curve, and dual-attestation training are patent-relevant
  precisely because they are novel. Standards, wrappers, and protocol
  plumbing are not patented and never will be.

---

## Patent-Defensible Composition

Three claim families have been filed as part of the HyperDAG Protocol IP
portfolio. All three are referenced at a high level so collaborators can
make informed integration decisions. **Implementation details are not
disclosed here.** Patent counsel reviews any public disclosure before
publication.

- **P-001 — RepID dual-attestation training.** A reputation system in which
  principal and agent RepIDs grow together through verified action, with a
  bounded scoring transformation that preserves privacy under ZKP.
- **P-002 — Inverse-stake curve.** A linkage primitive whose required
  collateral *decreases* as the human counterparty's reputation grows,
  inverting the typical bond-up-front model.
- **P-003 — Pythagorean Comma BFT veto.** A Byzantine-fault-tolerant
  consensus mechanism in which a decisive minority veto overrides a majority
  pass when the dissonance gap exceeds the comma threshold (531441/524288 ≈
  1.013643).

The math constants used in the veto check are public and shipped in
`packages/defaults/validation-trinity/`. The mechanism that consumes them
is the patent-relevant composition.

---

## Phased Release Roadmap

| Version | Target | Highlights |
| :--- | :--- | :--- |
| **v0.1** | May 2026 (this week) | Six interfaces + six curated defaults. `npm install @hyperdag/protocol@0.1.0-alpha`. Trinity Symphony as reference impl. |
| **v0.2–0.3** | Q2 2026 | Community PRs for additional implementations. Receipt-Bridge mainnet expansion. PWA resurrection. |
| **v0.5** | Q3 2026 | Reputation-weighted snapshot governance votes. ZKP federated learning live. ABL/ABI nightly evolution operating publicly. |
| **v1.0** | Q4 2026 | Three-branch DAO. Founder step-back complete. RetroPGF rewards from slashing pool. Hybrid Telegram + PWA surfaces. |

See [GOVERNANCE_ROADMAP.md](GOVERNANCE_ROADMAP.md) for the bootstrap-to-community
handover specifics.

---

## Open Questions for Collaborators

Three sharp questions for the ERC-8004 contributor community
(Marco De Rossi, Leonard Tan, Vitto Rivabella):

1. **ERC-8004 evolution alignment.** Does exposing ERC-8004 via `IIdentity`
   (swappable, with the ERC-8004 default ready to ship) align with your
   vision for ERC-8004 v2 evolution? Or would you prefer HDP's `IIdentity`
   hew more closely to v1 semantics until v2 is finalized?
2. **Linkage Registry as sibling to Reputation Registry.** We are designing
   the Linkage Registry as a sibling pattern to ERC-8004's Reputation
   Registry, particularly the inverse-stake design. Does this composition
   make sense to you, or do you see a reason to subsume linkage under
   Reputation?
3. **IIdentity edge cases.** What edge cases from early ERC-8004
   implementations should HDP design against in its `IIdentity` contract?
   Specifically interested in failure modes around ownership transfer,
   metadata URI resolution under network partitions, and registry
   deprecation paths.

---

## Cross-Reference Files

- [README.md](README.md) — project intro, modular kernel framing, ecosystem
- [GOVERNANCE_ROADMAP.md](GOVERNANCE_ROADMAP.md) — bootstrap-to-community handover
- [METHODOLOGY.md](METHODOLOGY.md) — research methodology, benchmarks
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to contribute
- [SECURITY.md](SECURITY.md) — responsible disclosure
- [`packages/interfaces/`](packages/interfaces/) — six interface contracts
- [`packages/defaults/`](packages/defaults/) — six wired default implementations
- [`packages/protocol/`](packages/protocol/) — `@hyperdag/protocol` meta-package
- [`packages/contracts/`](packages/contracts/) — ERC-8004 + receipt-bridge contracts

---

> **Mission anchor:** Help people help people — the last, the lost, and the
> least.
>
> *"He has shown you, O mortal, what is good. And what does the LORD require
> of you? To act justly and to love mercy and to walk humbly with your God."
> — Micah 6:8*
>
> *"Whatever is true, whatever is noble, whatever is right..." — Philippians 4:8*
