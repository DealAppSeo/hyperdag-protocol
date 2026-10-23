# Acknowledgements

HyperDAG is built on other people's work. Thank you.

## ERC-8004: Trustless Agents

The standard every HyperDAG agent identity and reputation write uses. ERC-8004 is a community effort coordinated by **Marco De Rossi** (MetaMask) and **Davide Crapis** (Ethereum Foundation), with the co-authorship of **Jordan Ellis** (Google) and **Erik Reppel** (Coinbase). The core team is joined by **Leonard Tan** (MetaMask), **Vitto Rivabella** (Ethereum Foundation) and **Isha Sangani** (Ethereum Foundation).

- Specification: [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004)
- The registry contracts, the spec copy and the ABIs in [`packages/contracts`](packages/contracts) are the team's work, from [erc-8004/erc-8004-contracts](https://github.com/erc-8004/erc-8004-contracts), with their commit history. That history is why the team appears in this repository's contributor graph. Twenty files are byte-identical to upstream commit `b9e466c`; [`packages/contracts/NOTICE`](packages/contracts/NOTICE) lists each one, the files that differ, and the licences: MIT for the Solidity sources (CC0-1.0 for `SingletonFactory.sol`) and ISC for the package.
- The registries on Base Sepolia, and on mainnet, are the team's deployments. We use them; we do not operate them.

## Other work we build on

- **x402** by Coinbase ([coinbase/x402](https://github.com/coinbase/x402)): the agent-to-agent payment protocol. Our engine implements it itself, on a test network.
- **Plonky3** by Polygon Labs ([Plonky3/Plonky3](https://github.com/Plonky3/Plonky3)), with the **Poseidon2** hash: the proof system our prover, HyperDAG-core, uses.
- **OpenZeppelin Contracts**, which the ERC-8004 contracts build on.
- **The Ethereum Attestation Service**, which we use to anchor batches of proofs.
- **Base Sepolia**, the test network all of this runs on today.
- **The model providers our checks and test loops run on**, among them Groq, Cerebras and OpenRouter, and the public benchmark datasets credited where each is used (FEVER, HaluEval, TruthfulQA).

## Research we lean on

[`docs/WHY.md`](docs/WHY.md) explains why we build what we build, and cites the research for and against each part of it.

If we have missed you, or credited you wrongly, please open an issue. We will fix it.
