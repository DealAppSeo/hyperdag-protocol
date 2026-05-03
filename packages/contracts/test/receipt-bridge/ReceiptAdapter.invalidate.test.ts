import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";

import {
  defaultParams,
  commitHashOf,
  signParams,
  toRevealStruct,
  deployStack,
  mineBlocks,
} from "./helpers.js";

describe("HyperDAGReceiptAdapter — invalidate", async () => {
  const conn = await network.connect();
  const { viem } = conn;
  const wallets = await viem.getWalletClients();
  const owner = wallets[0]!;
  const committer = wallets[1]!;
  const stranger = wallets[2]!;
  const publicClient = await viem.getPublicClient();
  const provider = (conn as any).provider ?? (conn as any).network?.provider;

  async function setupAndReveal() {
    const { adapter, idReg, verifier, impl, proxy } = await deployStack(viem, owner.account.address);
    await idReg.write.setOwner([1n, committer.account.address]);
    const adapterAsCommitter = await viem.getContractAt(
      "HyperDAGReceiptAdapter",
      adapter.address,
      { client: { wallet: committer } },
    );
    const params = defaultParams({ nonce: 41n });
    const ch = commitHashOf(params, committer.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsCommitter.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(committer, params);
    const txHash = await adapterAsCommitter.write.revealReceipt([toRevealStruct(params)]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const topic = keccak256(
      toHex(
        "ReceiptRevealed(bytes32,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,uint8,uint8,bytes32,bytes32,uint256,address,uint64)",
      ),
    );
    const log = receipt.logs.find((l) => l.topics[0] === topic);
    const receiptId = log!.topics[1]! as `0x${string}`;
    return { adapter, adapterAsCommitter, receiptId };
  }

  it("original committer can invalidate", async () => {
    const { adapterAsCommitter, receiptId } = await setupAndReveal();
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsCommitter.write.invalidateReceipt([receiptId, "self-revoked"]),
    });
    const r = await adapterAsCommitter.read.getReceipt([receiptId]);
    assert.equal(r.status, 1);
  });

  it("contract owner can invalidate", async () => {
    const { adapter, receiptId } = await setupAndReveal();
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.invalidateReceipt([receiptId, "policy-revoked"]),
    });
    const r = await adapter.read.getReceipt([receiptId]);
    assert.equal(r.status, 1);
  });

  it("other addresses cannot invalidate", async () => {
    const { adapter, receiptId } = await setupAndReveal();
    let threw = false;
    try {
      await adapter.simulate.invalidateReceipt([receiptId, "nope"], {
        account: stranger.account,
      });
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /NotInvalidatorAuthorized/);
    }
    assert.ok(threw);
  });

  it("invalidated receipt is still queryable", async () => {
    const { adapter, adapterAsCommitter, receiptId } = await setupAndReveal();
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsCommitter.write.invalidateReceipt([receiptId, "x"]),
    });
    const r = await adapter.read.getReceipt([receiptId]);
    assert.equal(r.status, 1);
    assert.notEqual(r.agentId, 0n);
  });

  it("cannot un-invalidate", async () => {
    const { adapter, adapterAsCommitter, receiptId } = await setupAndReveal();
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsCommitter.write.invalidateReceipt([receiptId, "first"]),
    });
    let threw = false;
    try {
      await adapterAsCommitter.simulate.invalidateReceipt([receiptId, "second"]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /AlreadyInvalidated/);
    }
    assert.ok(threw);
  });
});
