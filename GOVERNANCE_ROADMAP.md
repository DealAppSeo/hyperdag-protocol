# Governance Roadmap

## Why Governance Matters Here

HyperDAG Protocol is a trust infrastructure for AI agents. The reputation an agent earns (RepID) only means something if the formula behind it is fair, transparent, and resistant to gaming.

We take Goodhart's law seriously:
> "When a measure becomes a target, it ceases to be a good measure."

Any single-authority RepID formula — including ours today — is vulnerable to gaming, drift, and value-capture by whoever controls it. The path forward is community governance over what the measure measures.

## Our Vision

A safe and equitably democratized AI ecosystem where individual users and agents contribute to the reputation of all AIs and LLMs — so that truth, helpfulness, and honest behavior become measurable, valuable, and earned.

We believe:

- **Earned reputation that cannot be gamed is valuable.** It's the foundation for trust between humans and autonomous agents.
- **The measure must be set by those it affects.** Not by us alone. Not by capital. By the community of users and agents who interact with it.
- **Reputation should reward helping others**, not gaming the system. Incentives must align with outcomes that matter for the greater good — and especially for the last, the lost, and the least: those who are often underbanked, uneducated, or disenfranchised.
- **Tools should help people help people.** That's the test. If governance choices stop serving that, they fail.

## Current State (V1, May 2026)

HyperDAG Protocol is in early-stage development. Today, governance decisions — including the RepID weighted formula, the Pythagorean Comma damping value, peer verification thresholds, and constitutional bounds — are maintained by **Sean Goodwin** on behalf of HyperDAG.

The implementation is **Apache 2.0** licensed; the governance follows that openness over time. Every parameter is published openly at [trustshell.dev/repid](https://trustshell.dev/repid).

## Path To Community Governance

### V1.5 (~weeks) — Open Contribution To The Formula

The [/repid page](https://trustshell.dev/repid) at trustshell.dev invites anyone and everyone to weigh in on what the RepID formula should measure. What should count? What should weight more? What's missing?

Current weights remain public. Suggestions are logged transparently. Formula changes require a public PR with rationale.

### V2 (~1-2 months) — Multi-Signer Governance On Critical Parameters

The Pythagorean Comma value, HAL thresholds, and peer verification quorum become multi-signer decisions. Proposals are filed on-chain via the ERC-8004 ReputationRegistry. Voting weight follows earned RepID, not capital.

### V2.5 (~3-6 months) — Constitutional Council

A small group of high-RepID human operators (with explicit consent to serve) review direction together. The selection process is itself community-designed — we don't get to pick the council ourselves.

### V3 (TBD) — Toward A DAO

The destination is a fully decentralized governance organization. The current thinking — open for discussion, not committed:

- **Token-less.** Voting weight follows demonstrated contribution (RepID), not capital. We don't want governance captured by whoever bought in early.
- **Quadratic voting under consideration.** Quadratic voting systems (per Glen Weyl, Vitalik Buterin, and others) help prevent concentration of governance power and reward broad support over narrow capital. It fits our values; we want community input on whether it fits the implementation.
- **Value-aligned incentives.** Governance participation should reward those who help others — not those who game the system. We're explicitly designing AGAINST extraction patterns common in token governance today.
- **Externally audited contracts.** Before any DAO mainnet deployment, contracts get independent security review.

## Q3 2026 Milestones

### Completed
- [x] 50K+ HAL evaluations (production pipeline)
- [x] 12 T12 agents in fleet (2 on-chain minted, 10 queued)
- [x] DragonflyDB caching layer (HAL cache, leaderboard, rate limiting)
- [x] Staking + sponsorship schema wired
- [x] ZKP routing configured (12 proof types)
- [x] Agent collaboration DNA tracking
- [x] x402 payment gate schema
- [x] Dispute claims workflow
- [x] Agent capability assessment (5 domains)

### In Progress
- [ ] Frontend rating + comparison voting (trustchat.dev)
- [ ] TrustShell v0.3.0 npm publish
- [ ] Plonky3 live prover connection
- [ ] StakingVault.sol deployment on Base Sepolia
- [ ] x402 payment integration with stablecoin

### Roadmap
- [ ] Mainnet deployment (post-patent filing)
- [ ] Provider self-registration
- [ ] Multi-chain support
- [ ] Agent marketplace (transfer with RepID reset)

## Principles

These hold regardless of which version we're in:

1. **Transparency over speed.** Every governance decision is logged publicly. No silent parameter changes.
2. **Apache 2.0 forever.** The implementation stays open. Forks are welcome. We don't extract through licensing.
3. **Earned voice.** Governance weight follows demonstrated contribution, not capital, credentials, or seniority.
4. **For the greater good.** Choices that benefit the protocol but harm the people it serves fail our test. The last, the lost, and the least are the metric.
5. **Goodhart-aware.** Every target we set, we expect to be gamed. Design accordingly.

## Open Decisions — Your Voice Welcome

These are not decided. We want input:

- **Quadratic voting specifics** — square-root, capped, hybrid?
- **Constitutional council selection** — how is the first council formed?
- **Disagreement resolution** — what's the fork etiquette? When do we acknowledge two legitimate paths?
- **Anti-Sybil mechanisms** — how do we prevent identity multiplication from gaming earned reputation?
- **Transition triggers** — what events move us from V1.5 → V2 → V2.5 → V3? Time? Adoption metrics? Community vote?

## Contributing

Governance discussions are explicitly welcome. Open an issue or discussion on this repo. Label it `governance` so it's easy to track. Or contribute via the [/repid page](https://trustshell.dev/repid).

We invite anyone and everyone to weigh in on the values that affect this weighted, portable Reputation ID — so that it measures things that matter, can and should be measured and improved, that are for the greater good.

---

> *"Help people help people — the last, the lost, and the least."*
> — Micah 6:8
