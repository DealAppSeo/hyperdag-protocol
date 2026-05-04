# @hyperdag/linkage-registry

Default HDP Linkage Registry implementation of `@hyperdag/interfaces`#`ILinkage`.

Implements the **inverse-stake curve** (P-002 patent claim): higher human RepID
⇒ lower required collateral. The novel design point is that established
participants face less friction binding to agents, while bootstrap participants
prove commitment through stake.

## Provenance

- v0.1.0-alpha: this is a stub registry that backs the interface with an
  in-memory store + a default inverse-stake curve. **No on-chain backing yet.**
- v0.2 plan: deploy a Linkage Registry contract as a sibling to ERC-8004's
  IdentityRegistry and ReputationRegistry, then refactor this package into
  a thin viem-based client.
- License: Apache-2.0

## Inverse-stake curve

For a human with RepID `r` (0..10000), the default curve is:

```
required_stake_usdt = max(STAKE_FLOOR, BASE_STAKE * (1 - r/SCALE))
```

with `BASE_STAKE = 1000 USDT` (1_000_000_000n in 6-decimal units),
`STAKE_FLOOR = 10 USDT`, `SCALE = 12000` (so even at the cap of 10000 RepID
the required stake is positive but small). Replacement implementations can
plug their own curve.

## Usage

```typescript
import { LinkageRegistryProvider } from '@hyperdag/linkage-registry';

const linkage = new LinkageRegistryProvider();

const required = await linkage.requiredStake('0xHumanAddress...');
const receipt = await linkage.bindHumanToAgent(
  '0xHumanAddress...',
  3749n,
  required,
);
```

## License

Apache-2.0.
