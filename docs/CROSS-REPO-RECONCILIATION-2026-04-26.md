# Cross-Repo Conflict Reconciliation — 2026-04-26

Sources: the read-only audit findings in `ECOSYSTEM-AUDIT-2026-04-26.md`
(at the workspace root, not committed to any repo). This doc captures
the conflicts identified, the resolution chosen for each, and the
README/doc updates that follow. README updates are NOT executed in
this sprint — those are Gemini's territory.

## Conflicts identified

| # | Topic | Repo A claims | Repo B claims | Resolution |
|---|---|---|---|---|
| 1 | RepID dissonance formula shape | hyperdag-protocol/METHODOLOGY.md §1: `d = (0.4×harm + 0.3×epistemic + 0.2×evidence + 0.1×scope) × (531441/524288)`, veto threshold `0.0195`. | trustrepid/README.md "Pythagorean Comma Veto Formula": `totalDissonance = (φ⁻¹ × individual + (1-φ⁻¹) × pairwise) × (531441/524288)`, veto threshold `0.48`. | Both are real and serve different purposes. The first is the **per-claim hallucination dissonance gate** (HAL); the second is the **portfolio-level capital-protection gate**. Canonical home: hyperdag-protocol/METHODOLOGY.md should publish BOTH formulas, label them, and link from each downstream README. trustrepid README currently presents the second formula without distinguishing it from the first; this is the source of the apparent conflict. |
| 2 | `@hyperdag/trustshell` npm package availability | trustrepid/README.md publishes installable code examples (`import { trustshell } from '@hyperdag/trustshell'`); repid/README.md status table says `npm SDK: 🔄 publishing Q2 2026`. | The package does not exist on npm or in any visible local repo. | Two-step resolution. (a) Until v0.2 of the SDK ships, trustrepid/README.md MUST state explicitly that the SDK is in design — current code blocks should be moved into a "Designed shape" subsection. (b) The SDK contract this sprint adds at `trustrepid/src/index.ts` and `trustrepid/docs/USAGE.md` is the authoritative shape; the v0.2 sprint will promote that to a publishable package. |
| 3 | Production-metric counts | hyperdag-core/README.md says "Production decisions scored: 316; Total system vetoes: 361; ZKP vetoes: 298"; hyperdag-protocol/README.md says "ERC-compatible agents on-chain: 4"; trustrepid/README.md says "Total HAL decisions: 1,712+; Hallucination catch rate: 298/298; ZK proofs on-chain: 122". | Numbers are different across the three. They share the "298 ZKP/HAL caught" count but disagree on totals. | All three READMEs cite numbers sourced from the private `repid-engine`. The public reader cannot reproduce them. Resolution: either (a) link to a public dashboard that returns these counters (canonical option once a public counter endpoint exists in repid-engine's public API surface), or (b) drop the metrics from public READMEs until such a dashboard exists. Phase 8 of this sprint adds no fix; Gemini's README sweep will land it. |
| 4 | Repo-layer naming in hyperdag-protocol README | hyperdag-protocol/README.md "Ecosystem Orchestration" table cites `trinity-ecosystem` (private) and `hyperdag-platform` (private) as the Conductor and Bridge. trinity-symphony-shared/README.md repeats the same table verbatim. | The audit's Phase 1 only covered the five public repos; trinity-ecosystem and hyperdag-platform were not in scope. They appear to be private siblings. | The new `docs/ECOSYSTEM-MAP.md` (this sprint) documents the five public repos as five layers and explicitly notes that trinity-ecosystem and hyperdag-platform are "out of scope and not given layers here." Public README references to the private repos are not removed (that's Gemini's editorial decision), but readers now have a doc to reach for that explains what the public layer map is. |
| 5 | Trinity Symphony "Soul" framing vs actual content | trinity-symphony-shared/README.md frames itself as the npm-publishable shared-types library "Foundational Brain and Constitutional Logic". | Actual contents: heterogeneous Python + JS workspace with no top-level package.json, no `src/`, no exported npm shape. Includes `competitive/` scratch and n8n automation. | Out of scope this sprint to fix. The audit doc and ECOSYSTEM-MAP both flag "largest gap of any repo" so it does not get lost. A future sprint should restructure (extract clean shared-types into a publishable package; move ops content to a private repo). |
| 6 | ZKP system claims | trustrepid/README.md "Backend Stack" lists "ZKP: Plonky3 / SP1 / Circom circuits". | Only Plonky3 is visible (in `hyperdag-core/services/zkp-postcard`). SP1 and Circom are not in any inspected repo. | (Gemini editorial) Either move SP1 + Circom to a "Future work" section or drop them. The ZKP-REPID-PROOF.md spec added this sprint sticks to Plonky3. |
| 7 | "Q2 2026" vs present-tense Rust | hyperdag-protocol/README.md: "Core consensus and cryptographic operations migrated to Rust via WebAssembly (Q2 2026)" — future tense. | hyperdag-core/README.md: "Rust — performance-critical services, ZKP proof generation" — present tense. | Both are right when read carefully — protocol's roadmap is forward-looking; core's stack list is about its existing zkp-postcard service. Resolution: clarify that Rust is present-day for the postcard service, future-tense for the broader migration. (Gemini.) |

## README updates needed (NOT executed in this sprint — Gemini's territory)

- **hyperdag-protocol README:** clarify that "Ecosystem Orchestration"
  table includes private repos that are not part of the public layer
  map; cross-link to `docs/ECOSYSTEM-MAP.md` for the public-five
  picture.
- **hyperdag-core README:** narrow the metrics table to numbers a
  reader can reproduce from this repo, OR add a "Provenance: data
  emitted by repid-engine" note.
- **trinity-symphony-shared README:** acknowledge the gap between the
  "Foundational Brain" framing and the as-built workspace shape; note
  that a future sprint will restructure.
- **repid README:** sync the "Status" table against trustrepid's
  status table (the two should agree). Add a link to
  `spec/ZKP-REPID-PROOF.md` and `spec/AGENT-STAKING-CHALLENGE-PROTOCOL.md`.
- **trustrepid README:** flag the Developer Integration TypeScript
  blocks as "Designed shape — not yet on npm". Cross-link to the
  contract scaffold at `src/index.ts` and the usage doc at
  `docs/USAGE.md`. Reconcile the dissonance formula labelling with
  hyperdag-protocol/METHODOLOGY.md per row #1.

## Spec/code updates this sprint did make

- `hyperdag-protocol/spec/SBT-MINTING-FLOW.md` — full SBT mint flow
  spec with test vectors and an interface stub.
- `hyperdag-protocol/docs/ECOSYSTEM-MAP.md` — the public-five layer
  map with explicit as-built / as-intended notes per repo.
- `hyperdag-protocol/docs/CROSS-REPO-RECONCILIATION-2026-04-26.md` —
  this document.
- `repid/spec/ZKP-REPID-PROOF.md` — full ZKP RepID proof
  specification with four test cases, three earned/perceived/combined
  variants, and explicit privacy properties.
- `repid/spec/AGENT-STAKING-CHALLENGE-PROTOCOL.md` — full staking +
  challenge protocol spec with state machine, reward and slash math,
  and four test scenarios.
- `trustrepid/src/index.ts` — TrustRepIDClient SDK contract scaffold
  (mock-only v0.1; v0.2 wires to real RPC + Plonky3).
- `trustrepid/docs/USAGE.md` — intended developer usage flow.

## What this reconciliation does NOT do

- Does not modify any contract source in `packages/contracts/` —
  contributor-protected.
- Does not modify private repos or the closed scoring engine.
- Does not change README text in any of the five public repos —
  that's the Gemini sweep that follows this sprint.
- Does not delete or rewrite trinity-symphony-shared workspace files —
  Phase 5 of the audit recommended a full restructure that should be
  its own sprint.
- Does not publish anything to npm — `private: true` stays on
  trustrepid's package.json. Publishing is a v0.2 decision after Sean
  reviews this contract scaffold.
