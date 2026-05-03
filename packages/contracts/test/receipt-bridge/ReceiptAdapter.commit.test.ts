import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";

import {
  defaultParams,
  commitHashOf,
  deployStack,
} from "./helpers.js";

describe("HyperDAGReceiptAdapter — commit", async () => {
  const conn = await network.connect();
  const { viem } = conn;
  const wallets = await viem.getWalletClients();
  const owner = wallets[0]!;
  const publicClient = await viem.getPublicClient();

  it("can commit a receipt", async () => {
    const { adapter } = await deployStack(viem, owner.account.address);
    const params = defaultParams();
    const ch = commitHashOf(params, owner.account.address);
    const txHash = await adapter.write.commitReceipt([ch]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    const blk = await adapter.read.commitBlock([ch]);
    assert.ok(blk > 0n, "commit block should be recorded");
  });

  it("cannot commit the same hash twice", async () => {
    const { adapter } = await deployStack(viem, owner.account.address);
    const params = defaultParams({ nonce: 7n });
    const ch = commitHashOf(params, owner.account.address);
    const tx1 = await adapter.write.commitReceipt([ch]);
    await publicClient.waitForTransactionReceipt({ hash: tx1 });
    let threw = false;
    try {
      await adapter.simulate.commitReceipt([ch]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /CommitAlreadyExists/);
    }
    assert.ok(threw, "expected revert on duplicate commit");
  });

  it("emits ReceiptCommitted with committer + commitHash", async () => {
    const { adapter } = await deployStack(viem, owner.account.address);
    const params = defaultParams({ nonce: 42n });
    const ch = commitHashOf(params, owner.account.address);
    const txHash = await adapter.write.commitReceipt([ch]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const eventTopic = keccak256(toHex("ReceiptCommitted(address,bytes32,uint64)"));
    const log = receipt.logs.find((l) => l.topics[0] === eventTopic);
    assert.ok(log, "ReceiptCommitted event missing");
    assert.equal(
      log!.topics[1]!.toLowerCase(),
      ("0x" + owner.account.address.slice(2).padStart(64, "0")).toLowerCase(),
    );
    assert.equal(log!.topics[2], ch);
  });
});
