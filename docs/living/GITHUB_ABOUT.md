# GITHUB_ABOUT — repo About boxes (L12)

Checklist for GitHub **About** (description, website, topics). Not F-PINS (profile pins). Not a new product.

Measured **2026-09-16** via `gh api`. Fill empty fields from this table. Do **not** invent a homepage. Do **not** overwrite a good description. Do not say “MVP launched.”

Public surface = the [ECOSYSTEM.md](./ECOSYSTEM.md) table. Frozen folders (TrustMarket UI, new landings, etc.) stay empty on purpose.

| Repo | Description now | Website now | Topics now | Do |
|---|---|---|---|---|
| [hyperdag-protocol](https://github.com/DealAppSeo/hyperdag-protocol) | *(empty)* | *(empty)* | none | Set description from row below. Leave website empty (no product site for the kernel). Add topics. |
| [trustshell](https://github.com/DealAppSeo/trustshell) | Safe and Ethical Trust Layer for Agentic AI | https://trustshell.dev | none | Keep description + website. Add topics. XC2 may do this; XC1 does not rewrite the site. |
| [example-agent](https://github.com/DealAppSeo/example-agent) | Example AI agent integrating TrustShell — HAL fact-check before responding (keyless demo + RepID SDK mode) | *(empty)* | none | Keep description. Leave website empty until L1 ships a URL. Topics optional. XC2 owns this repo. |
| [trust-commons](https://github.com/DealAppSeo/trust-commons) | The Trust Commons — conversation / debate (already set) | *(empty)* | present | Keep. Leave website empty. Debate, not a download. |
| [hyperdag-proof-verifier](https://github.com/DealAppSeo/hyperdag-proof-verifier) | Verify HyperDAG Plonky3 STARK RepID proofs client-side (WASM). Trust math, not a server. | *(empty)* | ? | Keep description. ECOSYSTEM name `proof-verifier` maps to this repo. |
| [repid-engine](https://github.com/DealAppSeo/repid-engine) | HyperDAG Protocol's Trust Harness - a behavioral reputation scoring engine. | hyperdag.org | ? | Keep. Not an npm product. |

## Proposed protocol About (apply this hour)

```
description: Interface kernel + curated defaults (ERC-8004 / HAL / x402). @hyperdag/protocol is not on npm — install @hyperdag/trustshell.
topics: erc-8004, x402, agents, reputation
homepage: (none)
```

## Proposed trustshell topics (do not change description)

`erc-8004`, `x402`, `mcp`, `agents`, `reputation`

F-PINS (Sean): pin trustshell, repid-engine, hyperdag-protocol, trust-commons, proof-verifier, example-agent on the org/profile. That is not this file.
