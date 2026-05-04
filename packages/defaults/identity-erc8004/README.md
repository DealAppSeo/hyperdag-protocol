# @hyperdag/identity-erc8004

Default ERC-8004 implementation of `@hyperdag/interfaces`#`IIdentity`.

A thin client over the deployed ERC-8004 IdentityRegistry. The registry on
Base Sepolia lives at `0x8004A818BFB912233c491871b3d84c89A494BD9e` (vanity
address). For other chains, configure via the constructor.

## Provenance

Wraps the on-chain ERC-8004 IdentityRegistry deployed from this monorepo:
- Source: `packages/contracts/contracts/IdentityRegistryUpgradeable.sol`
- Spec: `packages/contracts/ERC8004SPEC.md` (Marco De Rossi)
- Address (Base Sepolia): `0x8004A818BFB912233c491871b3d84c89A494BD9e`

The default implementation here is a TypeScript wrapper — it does not
re-implement the registry. The contract is the source of truth.

## Usage

```typescript
import { ERC8004IdentityProvider } from '@hyperdag/identity-erc8004';

const identity = new ERC8004IdentityProvider({
  rpcUrl: 'https://sepolia.base.org',
  registryAddress: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  // Optional: signer for write operations
  // signer: <viem WalletClient>
});

const file = await identity.resolve(3749n);
```

## v0.2 plan

Refactor to consume a published `@hyperdag/identity-erc8004-source` package
instead of in-repo wiring, so third parties can use the wrapper without
cloning the monorepo.

## License

Apache-2.0.
