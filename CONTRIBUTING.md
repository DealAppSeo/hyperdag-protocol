# Contributing to HyperDAG Protocol

We love your input! We want to make contributing to Trinity Symphony as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Vision: Help People Help People
We are building a democratized, individual-owned agentic AI ecosystem. Our community keeps corporate gatekeepers accountable. 

## Our Development Process
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Issue that pull request!

## Code Style
* Use TypeScript for all logic.
* Core cryptographic and consensus operations use [Rust](https://www.rust-lang.org/) (WASM bindings Q2 2026).
* ZK proofs use [Plonky3](https://github.com/Plonky3/Plonky3) — no trusted setup, recursive composition, WASM-compatible.
* Follow the [ERC-8004 spec](https://github.com/erc-8004/erc-8004-contracts) for all agent identity work.
* Reference the [x402 protocol](https://github.com/x402-rs/x402-rs) for agent payment integration.
- Follow the Trinity Constitution (Phil 4:8) in your logic and comments.
- Keep components modular and extensible.

## License
By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
