# @hyperdag/identity-erc8004-viem

Zero-config viem-backed ERC-8004 identity provider. Designed to be the
**local primary** behind the `identity` slot of `createHDP()`, with the
existing `@hyperdag/identity-erc8004` (the thin wrapper that requires a
caller-supplied client) usable as a remote-fallback / power-user surface.

## Defaults (Base Sepolia)

| Setting | Default |
|---|---|
| RPC URL | `https://sepolia.base.org` (public Base Sepolia RPC) |
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` (read-only) |
| Chain ID | `84532` |

All defaults overridable via constructor opts.

## Modes

- **read-only** (no signer) — `getAgent`, `ownerOf`, `tokenURI`, `getAgentWallet`, `balanceOf`, `getMetadata`, `getReputation` all work zero-config.
- **eoa-write** (caller supplies a private key OR a viem WalletClient) — `register`, `setAgentURI`, `transfer` available. Calls throw `MissingSignerError` with a one-liner example if a write is attempted in read-only mode.
- **broadcast-disabled** (testing) — `WriteGated.dryRun = true` collects the encoded calldata + intended target instead of broadcasting. Used by tests and the sprint smoke. **Default for safety.**

## Mainnet posture

`allowMainnet: true` must be passed explicitly to target `chainId=8453`. Belt-and-braces against accidental real-money writes during local dev.

## Usage

```ts
import { createHDP } from '@hyperdag/protocol';
import { ViemIdentityProvider } from '@hyperdag/identity-erc8004-viem';

// Zero-config read (no signer needed)
const hdp = createHDP({
  overrides: { identity: new ViemIdentityProvider({}) },
});
const file = await hdp.identity.resolve(3747n);
console.log(file.owner, file.metadataUri);

// Signed writes (BYO private key)
const provider = new ViemIdentityProvider({
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
});
const { agentId, txHash } = await provider.register({ metadataUri: 'ipfs://…' });
```

## What this package does NOT do

- **Bundle viem.** viem is a peer-dependency. The consumer installs it.
- **Sign mainnet writes by default.** `allowMainnet: true` required.
- **Bundle private keys, secrets, or a wallet.** Caller must supply.
- **Broadcast in `dryRun=true`** (default).

## License

Apache-2.0. Thin wrapper around public ABIs; no proprietary logic.
