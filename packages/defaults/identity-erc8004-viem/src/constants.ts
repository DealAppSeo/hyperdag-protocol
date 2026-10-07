/**
 * ERC-8004 canonical addresses — Base Sepolia (chainId 84532).
 *
 * Pulled from CLAUDE.md / XC functional audit 2026-05-28. These are the
 * ERC-8004 team's canonical upgradeable UUPS deployments
 * (https://github.com/erc-8004/erc-8004-contracts), and the addresses external
 * consumers should target. This repo documents and uses them; it does not
 * operate them. Until 2026-10-07 this comment credited them to our own team,
 * which was wrong; BUILDERS.md §1 has the correct account.
 * `npm run check:map` fails if that claim comes back.
 */

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

export const BASE_SEPOLIA_DEFAULT_RPC = 'https://sepolia.base.org';
export const BASE_MAINNET_DEFAULT_RPC = 'https://mainnet.base.org';

export const IDENTITY_REGISTRY_BASE_SEPOLIA =
  '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const;

export const REPUTATION_REGISTRY_BASE_SEPOLIA =
  '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const;

/** Mainnet ReputationRegistry per memory entry x402-real-signing-2026-05-23. */
export const REPUTATION_REGISTRY_BASE_MAINNET =
  '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63' as const;
