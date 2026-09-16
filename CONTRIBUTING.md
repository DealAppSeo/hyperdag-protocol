# Contributing to HyperDAG Protocol

**Maintainer: Sean Goodwin.** GitHub faces are a **commit counter**, not credit — see [AUTHORS.md](AUTHORS.md).

The stranger-facing product is [`@hyperdag/trustshell`](https://github.com/DealAppSeo/trustshell), not this repo. This repo is the interface kernel. `@hyperdag/protocol` is **not on npm**. Do not send “become a maintainer” mail; open a PR.

## What to send here vs elsewhere

| Change | Where |
|---|---|
| Kernel / living docs / AUTHORS / ecosystem table | **this repo** |
| Client, CLI, MCP, site copy | [trustshell](https://github.com/DealAppSeo/trustshell) |
| Scoring / settle / grounding | [repid-engine](https://github.com/DealAppSeo/repid-engine) |
| Attack the scoring *assumptions* | [trust-commons](https://github.com/DealAppSeo/trust-commons) (debate, not a download) |

## PR path

1. Fork. Branch from `main`.
2. Tests for code you add. `npm ci` then the jobs in `.github/workflows/ci.yml`.
3. No `package.json` version bump unless Sean asked. No `npm publish`. No prod SQL.
4. No “MVP launched.” Published npm is `@hyperdag/trustshell@1.3.0` until F-PUBLISH.
5. Open the pull request. MERGE_POLICY: agents may squash-merge when checks are green and the PR is not publish / DDL / secrets.

Security: [SECURITY.md](SECURITY.md). Ecosystem map: [`docs/living/ECOSYSTEM.md`](docs/living/ECOSYSTEM.md).

## License

By contributing, you agree your contributions are licensed under Apache 2.0.
