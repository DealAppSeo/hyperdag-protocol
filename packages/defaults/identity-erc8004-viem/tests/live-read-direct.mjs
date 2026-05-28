/**
 * Live read smoke (direct viem, no TS compile) — proves the canonical Base
 * Sepolia IdentityRegistry is reachable and the read pattern this package
 * uses works against the live chain.
 *
 * Constants + ABI inlined here so the smoke can run without compiling .ts.
 * The source-of-truth lives in src/constants.ts + src/abi.ts.
 *
 * Run:
 *   node tests/live-read-direct.mjs
 */

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const IDENTITY_REGISTRY_BASE_SEPOLIA = '0x8004A818BFB912233c491871b3d84c89A494BD9e';
const BASE_SEPOLIA_DEFAULT_RPC = 'https://sepolia.base.org';

const IDENTITY_REGISTRY_ABI = [
  { name: 'ownerOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }] },
  { name: 'tokenURI', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }] },
  { name: 'getAgentWallet', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }] },
];

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_DEFAULT_RPC),
});

console.log('\n=== LIVE ERC-8004 READ SMOKE (Base Sepolia, no signer) ===\n');
console.log(`registry = ${IDENTITY_REGISTRY_BASE_SEPOLIA}\n`);

let pass = 0, fail = 0;
const tokensToProbe = [3747n, 1n, 2n, 100n];

for (const tokenId of tokensToProbe) {
  try {
    const owner = await client.readContract({
      address: IDENTITY_REGISTRY_BASE_SEPOLIA,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
    });
    let uri = '';
    try {
      uri = await client.readContract({
        address: IDENTITY_REGISTRY_BASE_SEPOLIA,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'tokenURI',
        args: [tokenId],
      });
    } catch (e) {
      uri = `(tokenURI revert)`;
    }
    let wallet = '';
    try {
      wallet = await client.readContract({
        address: IDENTITY_REGISTRY_BASE_SEPOLIA,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getAgentWallet',
        args: [tokenId],
      });
    } catch (e) {
      wallet = '(getAgentWallet revert)';
    }
    console.log(`  agentId=${tokenId}: owner=${owner}`);
    console.log(`               uri=${uri}`);
    console.log(`               wallet=${wallet}`);
    pass++;
  } catch (e) {
    const msg = e?.shortMessage ?? e?.message?.split('\n')[0] ?? String(e);
    console.log(`  agentId=${tokenId}: ${msg}`);
    fail++;
  }
}

console.log(`\n=== READ RESULT: ${pass}/${tokensToProbe.length} succeeded (rest reverted / unknown tokenId — expected) ===`);
if (pass === 0) { console.error('FAIL — no successful reads.'); process.exit(1); }
console.log('=== smoke OK ===');
