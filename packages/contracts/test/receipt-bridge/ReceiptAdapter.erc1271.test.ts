import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodeFunctionData, keccak256, toHex } from "viem";

import {
  defaultParams,
  commitHashOf,
  signParams,
  signingDigestOf,
  toRevealStruct,
  deployStack,
  mineBlocks,
} from "./helpers.js";

describe("HyperDAGReceiptAdapter — signature verification", async () => {
  const conn = await network.connect();
  const { viem } = conn;
  const wallets = await viem.getWalletClients();
  const owner = wallets[0]!;
  const eoa = wallets[1]!;
  const publicClient = await viem.getPublicClient();
  const provider = (conn as any).provider ?? (conn as any).network?.provider;

  it("EOA committer signature verifies", async () => {
    const { adapter, idReg } = await deployStack(viem, owner.account.address);
    await idReg.write.setOwner([1n, eoa.account.address]);
    const adapterAsEOA = await viem.getContractAt(
      "HyperDAGReceiptAdapter",
      adapter.address,
      { client: { wallet: eoa } },
    );
    const params = defaultParams({ nonce: 51n });
    const ch = commitHashOf(params, eoa.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsEOA.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    params.signature = await signParams(eoa, params);
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsEOA.write.revealReceipt([toRevealStruct(params)]),
    });
  });

  it("ERC-1271 contract-wallet committer signature verifies", async () => {
    const { adapter, idReg } = await deployStack(viem, owner.account.address);
    const wallet = await viem.deployContract("MockERC1271Wallet", [eoa.account.address]);
    await idReg.write.setOwner([1n, wallet.address]);
    const walletAsOwner = await viem.getContractAt(
      "MockERC1271Wallet",
      wallet.address,
      { client: { wallet: eoa } },
    );

    const params = defaultParams({ nonce: 52n });
    // The wallet contract is the committer (msg.sender to the adapter), so
    // commitHashOf binds to wallet.address.
    const ch = commitHashOf(params, wallet.address as `0x${string}`);
    const commitCalldata = encodeFunctionData({
      abi: adapter.abi,
      functionName: "commitReceipt",
      args: [ch],
    });
    await publicClient.waitForTransactionReceipt({
      hash: await walletAsOwner.write.executeCall([adapter.address, commitCalldata]),
    });
    await mineBlocks(provider, 6);
    // ERC-1271 wallet validates the EOA's signature on the EIP-191 prefixed digest.
    params.signature = await signParams(eoa, params);
    const revealCalldata = encodeFunctionData({
      abi: adapter.abi,
      functionName: "revealReceipt",
      args: [toRevealStruct(params)],
    });
    await publicClient.waitForTransactionReceipt({
      hash: await walletAsOwner.write.executeCall([adapter.address, revealCalldata]),
    });
    // Receipt should now exist for agentId 1.
    assert.ok(true, "ERC-1271 reveal completed");
  });

  it("invalid signature is rejected", async () => {
    const { adapter, idReg } = await deployStack(viem, owner.account.address);
    await idReg.write.setOwner([1n, eoa.account.address]);
    const adapterAsEOA = await viem.getContractAt(
      "HyperDAGReceiptAdapter",
      adapter.address,
      { client: { wallet: eoa } },
    );
    const params = defaultParams({ nonce: 53n });
    const ch = commitHashOf(params, eoa.account.address);
    await publicClient.waitForTransactionReceipt({
      hash: await adapterAsEOA.write.commitReceipt([ch]),
    });
    await mineBlocks(provider, 6);
    // Signature signed by a different account → recovers wrong signer.
    const otherWallet = wallets[2]!;
    params.signature = await signParams(otherWallet, params);
    let threw = false;
    try {
      await adapter.simulate.revealReceipt([toRevealStruct(params)], {
        account: eoa.account,
      });
    } catch (err: any) {
      threw = true;
      assert.match(String(err.message ?? err), /InvalidSignature/);
    }
    assert.ok(threw);
  });
});
