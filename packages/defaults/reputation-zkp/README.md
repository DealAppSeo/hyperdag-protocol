# @hyperdag/reputation-zkp

Default ZKP RepID implementation of `@hyperdag/interfaces`#`IReputation`.

A thin HTTP client over the RepID scoring service. The scoring engine itself
is proprietary (`repid-engine`) and not redistributed under v0.1; this package
only provides the public interface surface and the ZK proof envelope shape.

## Provenance

- Service: HyperDAG RepID scoring engine (proprietary, behind authenticated API).
- Public proof system: Plonky3 (no trusted setup, recursive composition).
- Tier scheme: `CUSTODIED_DBT` (0–999) / `EARNING_AUTONOMY` (1000–4999) /
  `AUTONOMOUS` (5000–10000). The score range is fixed in v0.1; the mapping
  function is internal.

## Why a thin client

The RepID scoring formula and weighting are part of HyperDAG Protocol's
patent portfolio (P-001) and are not published. This default exposes only
what is necessary for downstream composition: get a score, submit feedback,
verify a proof, request a proof. Replacement implementations are free to use
their own scoring math.

## Usage

```typescript
import { ZKPRepIDProvider } from '@hyperdag/reputation-zkp';

const reputation = new ZKPRepIDProvider({
  apiUrl: 'https://repid.hyperdag.dev/api/v1',
  apiKey: process.env.REPID_API_KEY,
});

const score = await reputation.getScore(3749n);
```

## v0.2 plan

When the federated learning protocol goes live (v0.5+), this package will
gain an opt-in local-proof-generation path so consumers can produce proofs
without a round-trip to the scoring service.

## License

Apache-2.0 (this wrapper). Underlying scoring service is proprietary.
