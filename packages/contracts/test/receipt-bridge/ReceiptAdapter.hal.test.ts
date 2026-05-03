import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";

import {
  defaultParams,
  defaultHAL,
  commitHashOf,
  signParams,
  toRevealStruct,
  deployStack,
  mineBlocks,
} from "./helpers.js";

describe("HyperDAGReceiptAdapter — HAL commitment binding", async () => {
  const conn = await network.connect();
  const { viem } = conn;
  const wallets = await viem.getWalletClients();
  const owner = wallets[0]!;
  const publicClient = await viem.getPublicClient();
  const provider = (conn as any).provider ?? (conn as any).network?.provider;

  async function reveal(params: ReturnType<typeof defaultParams>) {
    const { adapter, idReg } = await deployStack(viem, owner.account.address);
    await idReg.write.setOwner([params.agentId, owner.account.address]);
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
    return { adapter, receiptId };
  }

  it("reveal with HALCommitment.dofVersion=5 succeeds", async () => {
    const params = defaultParams({
      nonce: 61n,
      hal: defaultHAL({ dofVersion: 5 }),
    });
    const { adapter, receiptId } = await reveal(params);
    const r = await adapter.read.getReceipt([receiptId]);
    assert.equal(r.hal.dofVersion, 5);
  });

  it("reveal with HALCommitment.dofVersion=6 succeeds", async () => {
    const params = defaultParams({
      nonce: 62n,
      hal: defaultHAL({ dofVersion: 6 }),
    });
    const { adapter, receiptId } = await reveal(params);
    const r = await adapter.read.getReceipt([receiptId]);
    assert.equal(r.hal.dofVersion, 6);
  });

  it("reveal with commaBftVerdict=1 (veto) succeeds — veto receipts are valid", async () => {
    const params = defaultParams({
      nonce: 63n,
      hal: defaultHAL({ commaBftVerdict: 1 }),
    });
    const { adapter, receiptId } = await reveal(params);
    const r = await adapter.read.getReceipt([receiptId]);
    assert.equal(r.hal.commaBftVerdict, 1);
  });

  it("HAL fields are queryable after reveal", async () => {
    const customHal = defaultHAL({
      dofVersion: 6,
      boundedScore: 9999n,
      commaBftVerdict: 0,
      outputHash: keccak256(toHex("hal-out-special")),
      dimensionsHash: keccak256(toHex("hal-dim-special")),
    });
    const params = defaultParams({ nonce: 64n, hal: customHal });
    const { adapter, receiptId } = await reveal(params);
    const r = await adapter.read.getReceipt([receiptId]);
    assert.equal(r.hal.dofVersion, customHal.dofVersion);
    assert.equal(r.hal.boundedScore, customHal.boundedScore);
    assert.equal(r.hal.commaBftVerdict, customHal.commaBftVerdict);
    assert.equal(r.hal.outputHash, customHal.outputHash);
    assert.equal(r.hal.dimensionsHash, customHal.dimensionsHash);
  });
});
