# COMMONS_PIN — “Attack the scoring assumptions” (L7)

Draft for a **pinned Discussions thread** on [trust-commons](https://github.com/DealAppSeo/trust-commons).  
Sean enables Discussions (F-DISCUSSIONS) and pastes this. **Code stays in trustshell / repid-engine.** This repo is debate, not a download.

---

**Title:** Attack the scoring assumptions

**Body:**

This is the Trust Commons. It is a conversation, not a package.

HyperDAG’s trust layer (HAL → ERC-8004 RepID → x402) is implemented in:

- [`DealAppSeo/trustshell`](https://github.com/DealAppSeo/trustshell) — the client you install
- [`DealAppSeo/repid-engine`](https://github.com/DealAppSeo/repid-engine) — the scoring engine

Do **not** open PRs here that “fix the formula.” Open them there. Here we argue whether the *assumptions* are wrong.

Assumptions worth attacking (non-exhaustive, not a product claim):

1. **Grounding is a label until enforce.** Ungrounded events still move a score in shadow/off. Is that the honest default for a visitor?
2. **Partial quorum ≠ full family set.** Live HAL has been two answering providers, not six. Copy that says “quorum of families” without the count is the thing to break.
3. **Exclusive `$0.10` floor.** Dust does not ground; exactly ten cents does not either. Is the bound in the right units? Is a wash still cheap above it?
4. **One `evidence_id` grounds one event, across agents.** Is that the right uniqueness? (Same payment, two agents — resisted.)
5. **Bound entities do not silently rot; unclaimed DBTs still decay.** Is “bound” the right predicate for L5?
6. **Score lane is engine-verified or it is absent.** A caller string is not a lane.
7. **Sepolia is not mainnet.** Reputation writes that leak to Base mainnet are a different product.

Rules for this thread:

- Cite a file, a probe, or a measurement. “I feel” is allowed; it is not evidence.
- No secrets, no prod IDs, no “MVP launched.”
- If you have a patch, link a PR on trustshell or repid-engine.

Maintainer: Sean Goodwin. Faces on the contributors graph are a commit counter, not credit — see [`AUTHORS.md`](../../AUTHORS.md).
