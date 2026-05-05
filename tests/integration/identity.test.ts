/**
 * Phase 2 — IIdentity against the deployed ERC-8004 IdentityRegistry on
 * Base Sepolia.
 *
 * Wires the kernel's ERC8004IdentityProvider with a real on-chain client
 * built from the deployed contract ABI. Tests:
 *   - resolve() against the four known production tokens (3747-3750)
 *   - register() — mints a NEW token (test wallet pollution; documented)
 *   - error case: resolve() on a non-existent token
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { Contract, type Eip1193Provider } from "ethers";
import { ERC8004IdentityProvider, type ERC8004ContractClient } from "@hyperdag/identity-erc8004";
import {
  baseSepolia,
  captureResult,
  env,
  identityRegistry,
  skipIfMissing,
  withRetry,
} from "./setup.ts";

const PHASE = "identity";

/** Build an ERC8004ContractClient backed by the real on-chain contract. */
function realContractClient(): ERC8004ContractClient {
  const contract = identityRegistry({ withSigner: true });
  return {
    async readAgent(agentId) {
      try {
        const owner = await withRetry(
          () => contract["ownerOf"]!(agentId),
          { label: `ownerOf(${agentId})` },
        ) as `0x${string}`;
        const metadataUri = await withRetry(
          () => contract["tokenURI"]!(agentId),
          { label: `tokenURI(${agentId})` },
        ) as string;
        return { owner, metadataUri };
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes("ERC721NonexistentToken") || msg.includes("nonexistent token")) return null;
        throw e;
      }
    },
    async register(metadataUri /*, owner*/) {
      // ERC-8004's register(string) mints to msg.sender; the owner arg is
      // honored only when msg.sender == owner. The real signer is
      // derived from BASE_SEPOLIA_PRIVATE_KEY.
      const tx = await withRetry(
        () => contract["register(string)"]!(metadataUri),
        { label: "register(string)" },
      );
      const receipt = await tx.wait();
      // Find the Transfer event for the new token id
      const transferEvent = receipt!.logs
        .map((l: { topics: string[]; data: string }) => {
          try {
            return contract.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .find((parsed: { name: string } | null) => parsed?.name === "Transfer");
      const tokenId = transferEvent
        ? (transferEvent as { args: { tokenId: bigint } }).args.tokenId
        : 0n;
      return {
        agentId: tokenId,
        txHash: receipt!.hash as `0x${string}`,
        blockNumber: receipt!.blockNumber,
      };
    },
    async transfer(agentId, _from, to) {
      const wallet = (contract as unknown as { runner: { address: string } }).runner;
      const tx = await contract["transferFrom"]!(wallet.address, to, agentId);
      const receipt = await tx.wait();
      return { txHash: receipt!.hash as `0x${string}` };
    },
  };
}

const KNOWN_TOKENS: Array<{ id: bigint; expectedNameSubstring: string }> = [
  { id: 3747n, expectedNameSubstring: "SOPHIA" },
  { id: 3748n, expectedNameSubstring: "RAVEN" },
  { id: 3749n, expectedNameSubstring: "ATLAS" },
  { id: 3750n, expectedNameSubstring: "GUARDIAN" },
];

const results: {
  resolved: Array<{ agentId: string; owner: string; metadataUri: string; nameMatch: boolean }>;
  registered?: { agentId: string; txHash: string; blockNumber: number; metadataUri: string };
  errorCases: Array<{ name: string; behavior: string }>;
} = {
  resolved: [],
  errorCases: [],
};

test("Phase 2.1 — IIdentity.resolve() against the four known production tokens", async () => {
  const skip = skipIfMissing("baseSepoliaRpcUrl", "baseSepoliaPrivateKey");
  if (skip) {
    console.log("SKIP:", skip.reason);
    return;
  }
  const identity = new ERC8004IdentityProvider({ client: realContractClient() });

  for (const { id, expectedNameSubstring } of KNOWN_TOKENS) {
    const file = await identity.resolve(id);
    assert.equal(file.agentId, id, `token #${id} agentId roundtrip`);
    assert.ok(file.owner.startsWith("0x"), `token #${id} owner is hex`);
    assert.equal(file.chainId, 84532, `token #${id} chainId is Base Sepolia`);
    assert.ok(file.metadataUri.length > 0, `token #${id} metadataUri non-empty`);
    // Expected URI is base64 data URL — decode and check name
    let nameMatch = false;
    if (file.metadataUri.startsWith("data:application/json;base64,")) {
      const b64 = file.metadataUri.replace("data:application/json;base64,", "");
      const json = Buffer.from(b64, "base64").toString("utf8");
      nameMatch = json.includes(expectedNameSubstring);
    }
    results.resolved.push({
      agentId: id.toString(),
      owner: file.owner,
      metadataUri: file.metadataUri.slice(0, 80) + (file.metadataUri.length > 80 ? "..." : ""),
      nameMatch,
    });
    assert.ok(nameMatch, `token #${id} metadata should contain "${expectedNameSubstring}"`);
  }
});

test("Phase 2.2 — IIdentity.register() mints a new token (TEST POLLUTION — documented)", async () => {
  const skip = skipIfMissing("baseSepoliaRpcUrl", "baseSepoliaPrivateKey");
  if (skip) {
    console.log("SKIP:", skip.reason);
    return;
  }
  const identity = new ERC8004IdentityProvider({
    client: realContractClient(),
    defaultSender: baseSepolia().wallet.address as `0x${string}`,
  });

  const nonce = `cc2-int-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const metadata = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: `CC2-INT-${nonce}`,
    description: `Integration test agent minted at ${new Date().toISOString()} — safe to ignore.`,
  };
  const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;

  const out = await identity.register({ metadataUri });
  assert.ok(out.agentId > 3750n, `new token id ${out.agentId} should be greater than the highest known (3750)`);
  assert.ok(out.txHash, "txHash should be present");
  assert.ok(out.blockNumber && out.blockNumber > 0, "blockNumber should be present");

  // Verify on-chain by reading the new token back
  const back = await identity.resolve(out.agentId);
  assert.equal(back.agentId, out.agentId);
  assert.equal(back.metadataUri, metadataUri);

  results.registered = {
    agentId: out.agentId.toString(),
    txHash: out.txHash,
    blockNumber: out.blockNumber!,
    metadataUri: metadataUri.slice(0, 60) + "...",
  };
});

test("Phase 2.3 — IIdentity.resolve() on non-existent token throws gracefully", async () => {
  const skip = skipIfMissing("baseSepoliaRpcUrl", "baseSepoliaPrivateKey");
  if (skip) {
    console.log("SKIP:", skip.reason);
    return;
  }
  const identity = new ERC8004IdentityProvider({ client: realContractClient() });

  let threw = false;
  let errMsg = "";
  try {
    await identity.resolve(99_999_999n);
  } catch (e) {
    threw = true;
    errMsg = (e as Error).message;
  }
  assert.equal(threw, true, "resolve() on a non-existent token should throw");
  assert.ok(
    errMsg.includes("not found") || errMsg.includes("99999999"),
    `error message should be informative; got: "${errMsg}"`,
  );
  results.errorCases.push({
    name: "resolve(99_999_999n)",
    behavior: `threw: ${errMsg.slice(0, 100)}`,
  });
});

test("Phase 2.4 — capture results", async () => {
  const path = captureResult(PHASE, results);
  console.log(`captured: ${path}`);
});

// silence unused-import warning from the type-only import
void ({} as Eip1193Provider | undefined);
void ({} as Contract | undefined);
