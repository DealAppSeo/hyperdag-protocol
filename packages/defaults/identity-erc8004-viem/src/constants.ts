/**
 * ERC-8004 canonical addresses — Base Sepolia (chainId 84532).
 *
 * Pulled from CLAUDE.md / XC functional audit 2026-05-28. These are the
 * upgradeable UUPS deployments operated by the HyperDAG team and are the
 * "canonical" addresses external consumers should target.
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
