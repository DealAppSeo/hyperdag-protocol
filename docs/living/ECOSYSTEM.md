# ECOSYSTEM — public table (L9)

Single snippet. The protocol README includes this table; do not let the two drift.

All Apache 2.0 unless noted. **trust-commons is a debate commons, not a download.**

| Repo | Role | Install? |
|---|---|---|
| **[hyperdag-protocol](https://github.com/DealAppSeo/hyperdag-protocol)** | Interface kernel + curated defaults. `@hyperdag/protocol` is **not on npm**. | Clone / read. Not `npm i`. |
| **[trustshell](https://github.com/DealAppSeo/trustshell)** | Drop-in client: HAL, ERC-8004 RepID, x402. Published `@hyperdag/trustshell` **1.3.0** until F-PUBLISH. | `npm i @hyperdag/trustshell` |
| **[repid-engine](https://github.com/DealAppSeo/repid-engine)** | Scoring engine (private formula). Not an npm product. | No |
| **[proof-verifier](https://github.com/DealAppSeo/proof-verifier)** | Client-side Plonky3 check; usually bundled inside trustshell. | Rarely direct |
| **[example-agent](https://github.com/DealAppSeo/example-agent)** | 60-second demo agent. | Clone; follow its README |
| **[trust-commons](https://github.com/DealAppSeo/trust-commons)** | **Debate commons** — conversation and attack-the-assumptions threads. Not a package, not a SDK, not a binary. | Open Discussions (F-DISCUSSIONS). Do not `npm i trust-commons`. |

Pinned debate text: [`COMMONS_PIN.md`](./COMMONS_PIN.md).
