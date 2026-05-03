import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

import {
  defaultParams,
  commitHashOf,
  signParams,
  toRevealStruct,
  deployStack,
  mineBlocks,
} from "./helpers.js";

describe("HyperDAGReceiptAdapter — front-run mitigation", async () => {
  const conn = await network.connect();
  const { viem } = conn;
  const wallets = await viem.getWalletClients();
  const alice = wallets[0]!;
  const eve = wallets[1]!;
  const publicClient = await viem.getPublicClient();
  const provider = (conn as any).provider ?? (conn as any).network?.provider;

  it("attacker cannot reveal another address's commit", async () => {
    const { adapter, idReg } = await deployStack(viem, alice.account.address);
    await idReg.write.setOwner([1n, alice.account.address]);
    const params = defaultParams({ nonce: 31n });
    // Alice computes her commit and submits it.
    const aliceCh = commitHashOf(params, alice.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([aliceCh]),
    });
    await mineBlocks(provider, 6);
    // Eve sees Alice's params on the mempool and tries to reveal them as herself.
    // The contract recomputes commitHashOf(params, eve.address) — different from
    // aliceCh — so commits[evesRecomputedHash] is zero and reveal reverts.
    params.signature = await signParams(alice, params);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params)], {
        account: eve.account,
      });
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /CommitNotFound/);
    }
    assert.ok(threw, "Eve must not be able to reveal Alice's commit");
  });

  it("attacker cannot replay a successful reveal with same nonce", async () => {
    const { adapter, idReg } = await deployStack(viem, alice.account.address);
    await idReg.write.setOwner([1n, alice.account.address]);
    const params = defaultParams({ nonce: 32n });
    const ch = commitHashOf(params, alice.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(alice, params);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.revealReceipt([toRevealStruct(params)]),
    });
    // Replay attempt: same params, same signature, same nonce — must revert.
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params)]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /NonceAlreadyUsed/);
    }
    assert.ok(threw);
  });
});
