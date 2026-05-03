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

describe("HyperDAGReceiptAdapter — reveal", async () => {
  const conn = await network.connect();
  const { viem } = conn;
  const wallets = await viem.getWalletClients();
  const owner = wallets[0]!;
  const publicClient = await viem.getPublicClient();
  const provider = (conn as any).provider ?? (conn as any).network?.provider;

  async function setup() {
    const stack = await deployStack(viem, owner.account.address);
    await stack.idReg.write.setOwner([1n, owner.account.address]);
    return stack;
  }

  it("cannot reveal without prior commit", async () => {
    const { adapter } = await setup();
    const params = defaultParams();
    params.signature = await signParams(owner, params);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params)]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /CommitNotFound/);
    }
    assert.ok(threw);
  });

  it("cannot reveal before 5-block delay", async () => {
    const { adapter } = await setup();
    const params = defaultParams({ nonce: 11n });
    const ch = commitHashOf(params, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch]),
    });
    params.signature = await signParams(owner, params);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params)]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /RevealTooEarly/);
    }
    assert.ok(threw);
  });

  it("cannot reveal with mismatched fields", async () => {
    const { adapter } = await setup();
    const params = defaultParams({ nonce: 12n });
    const ch = commitHashOf(params, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    const tampered = { ...params, agentId: 999n };
    tampered.signature = await signParams(owner, tampered);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(tampered)]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /CommitNotFound/);
    }
    assert.ok(threw, "tampered params produce a different commitHash");
  });

  it("cannot reveal with reused nonce", async () => {
    const { adapter } = await setup();
    const params = defaultParams({ nonce: 13n });
    const ch1 = commitHashOf(params, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch1]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(owner, params);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.revealReceipt([toRevealStruct(params)]),
    });
    // Second commit with same nonce, different fields → different commitHash, different signature, but same nonce.
    const params2 = defaultParams({ nonce: 13n, taskHash: keccak256(toHex("task-other")) });
    const ch2 = commitHashOf(params2, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch2]),
    });
    await mineBlocks(provider, 6);
    params2.signature = await signParams(owner, params2);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params2)]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /NonceAlreadyUsed/);
    }
    assert.ok(threw);
  });

  it("cannot reveal if msg.sender is not ERC-8004 owner of agentId", async () => {
    const { adapter, idReg } = await setup();
    const stranger = wallets[1]!;
    await idReg.write.setOwner([2n, stranger.account.address]);
    const params = defaultParams({ nonce: 14n, agentId: 2n });
    const ch = commitHashOf(params, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(owner, params);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params)]);
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /NotAgentOwnerOrOperator/);
    }
    assert.ok(threw);
  });

  it("can reveal successfully with valid params and emits ReceiptRevealed", async () => {
    const { adapter } = await setup();
    const params = defaultParams({ nonce: 21n });
    const ch = commitHashOf(params, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(owner, params);
    const txHash = await adapter.write.revealReceipt([toRevealStruct(params)]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const topic = keccak256(
      toHex(
        "ReceiptRevealed(bytes32,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,uint8,uint8,bytes32,bytes32,uint256,address,uint64)",
      ),
    );
    const log = receipt.logs.find((l) => l.topics[0] === topic);
    assert.ok(log, "ReceiptRevealed event missing");
    const receiptId = log!.topics[1]!;
    const stored = await adapter.read.getReceipt([receiptId as `0x${string}`]);
    assert.equal(stored.agentId, 1n);
    assert.equal(stored.x402PaymentHash, params.x402PaymentHash);
    assert.equal(stored.taskHash, params.taskHash);
    assert.equal(stored.resultHash, params.resultHash);
    assert.equal(stored.repIdCommitment, params.repIdCommitment);
    assert.equal(stored.scoreVersion, 5n);
    assert.equal(stored.status, 0);
    assert.equal(stored.committer.toLowerCase(), owner.account.address.toLowerCase());
  });

  it("receiptId is deterministic and queryable", async () => {
    const { adapter } = await setup();
    const params = defaultParams({ nonce: 22n });
    const ch = commitHashOf(params, owner.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapter.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(owner, params);
    const txHash = await adapter.write.revealReceipt([toRevealStruct(params)]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const topic = keccak256(
      toHex(
        "ReceiptRevealed(bytes32,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,uint8,uint8,bytes32,bytes32,uint256,address,uint64)",
      ),
    );
    const log = receipt.logs.find((l) => l.topics[0] === topic);
    const receiptId = log!.topics[1]! as `0x${string}`;
    const r1 = await adapter.read.getReceipt([receiptId]);
    const r2 = await adapter.read.getReceipt([receiptId]);
    assert.equal(r1.agentId, r2.agentId);
    assert.equal(r1.committer, r2.committer);
  });
});
