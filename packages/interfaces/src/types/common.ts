/**
 * Shared primitive types used across all six HyperDAG Protocol interfaces.
 *
 * These are intentionally minimal: an interface contract should describe shape,
 * not implementation. Each default in `@hyperdag/defaults/*` is free to extend
 * these types via inheritance for its specific backing technology.
 */

/**
 * Hex-encoded string with `0x` prefix. Used for hashes, signatures, encoded calldata.
 */
export type Hex = `0x${string}`;

/**
 * Ethereum-style address. Lowercased or checksummed; implementations should
 * normalize before persistence.
 */
export type Address = `0x${string}`;

/**
 * Chain ID per EIP-155. Used to scope identity, payments, and receipts.
 * Default implementations target Base Sepolia (84532) unless configured otherwise.
 */
export type ChainId = number;

/**
 * keccak-256 (or domain-equivalent) digest. Always 0x + 64 hex chars.
 */
export type Hash32 = Hex;

/**
 * Opaque receipt identifier. May be content-addressed (hash of the receipt body)
 * or a registry-issued ID. Implementations document which.
 *
 * Critical note from off-chain/on-chain integration: an off-chain receipt id
 * is NOT necessarily equal to an on-chain receipt id (the contract may derive
 * its own). The shared join key is `contentHash`, exposed separately on
 * receipt-related result types.
 */
export type ReceiptId = string;

/**
 * Unix timestamp in seconds.
 */
export type UnixSeconds = number;
