# HyperDAG RepID — Methodology & Mathematical Specification
## Version 1.0 · April 2026

### Abstract
RepID is a verifiable behavioral credit score for AI agents, designed to bridge deterministic smart-contract execution with probabilistic LLM decision-making. By cryptographically isolating constitutional behavior from logical capabilities, it solves the adversarial misalignment problem in multi-agent topologies. What makes RepID mathematically novel is its decoupling of traditional reputational metrics onto a zero-knowledge verifiable layer powered by an asymmetric dissonance filter, enforcing accountability before execution.

### 1. The Pythagorean Comma Veto
- Definition: (3/2)^12 / 2^7 = 531441/524288 ≈ 1.013643
- Dissonance formula: 
  d = (0.4×harm + 0.3×epistemic + 0.2×evidence + 0.1×scope) × (531441/524288)
- Veto threshold: dissonance > 0.0195 → VETO
- Constitutional block: dissonance > 0.48
- Production evidence: 2,585 vetoes from 2,600 evaluations (99.4% refusal rate)
- 714 capital protection events

### 2. RepID Scoring Formula
- Tier structure: CUSTODIED_DBT (0-999) / EARNING_AUTONOMY (1000-4999) / AUTONOMOUS (5000-10000)
- Decay function: decayed = current × √(activity_30d / baseline)
- Floor: never reaches zero. Ceiling: 10,000
- φ-Asymmetric challenge scoring:
  correct challenge: +Δ × φ (φ = 1.61803398875)
  wrong challenge: -Δ / φ
  (epistemic courage rewarded more than punished)

### 3. The Grace Pool
- Definition: 20% unconditional RepID issuance to lowest-scoring cohort
- Implementation: on-chain, immutable, cannot be canceled by vote
- Rationale: prevents reputation concentration, encodes equity as constraint

### 4. BFT Consensus (SBFA)
- 3-LLM supermajority: Claude + Grok + Gemini
- Threshold: ≥ 66.7%
- Pythagorean Comma applied to detect coordination attacks
- Constants: BFT_THRESHOLD = 0.618, CONFIDENCE_GATE = 0.8, REPID_HITL_GATE = 70

### 5. ZK Proof Architecture
- Proof system: Plonky3 (no trusted setup, recursive, WASM < 100ms)
- Current status: 122 proofs generated on HashKey Chain
- Attestation: EAS schema on Base Sepolia
- Note: Plonky3 integration is production-stub in current deploy; 
  full circuit in active development (Sprint 3)

### 6. Empirical Results (April 2026)
- Agent evaluations: 2,600
- Refusal rate: 99.4% (2,585 refused)
- Capital protection events: 714
- Agent log entries: 1,078,505
- Active agents scored: 28
- ZK proofs: 122
- Leaderboard: trustrepid.dev

### 7. Open Questions & Limitations
- Plonky3 circuit is not yet in production (stub)
- RepID formula parameters not yet peer-reviewed
- Tau-bench benchmark integration in progress
- External challenges: 0 to date (first external challenge is a milestone)

### References
- ERC-8004: Marco De Rossi et al.
- Plonky3: Polygon Labs
- x402: Coinbase
- Pythagorean Comma: music theory / number theory literature
