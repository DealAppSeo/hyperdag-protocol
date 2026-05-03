import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  zeroAddress,
  toHex,
  pad,
} from "viem";

export type Hex = `0x${string}`;

export const ZERO_BYTES32: Hex = "0x0000000000000000000000000000000000000000000000000000000000000000";

export interface HALCommitment {
  dofVersion: number;
  outputHash: Hex;
  boundedScore: bigint;
  commaBftVerdict: number;
  dimensionsHash: Hex;
}

export interface ReceiptParams {
  agentId: bigint;
  x402PaymentHash: Hex;
  taskHash: Hex;
  resultHash: Hex;
  repIdCommitment: Hex;
  hal: HALCommitment;
  humanIdentityRoot: Hex;
  receiptUriHash: Hex;
  receiptContentHash: Hex;
  scoreVersion: bigint;
  nonce: bigint;
  signature: Hex;
  proof: Hex;
}

export function defaultHAL(overrides: Partial<HALCommitment> = {}): HALCommitment {
  return {
    dofVersion: 5,
    outputHash: keccak256(toHex("hal-output-canonical-json")),
    boundedScore: 4200n,
    commaBftVerdict: 0,
    dimensionsHash: keccak256(toHex("hal-dimensions-canonical-json")),
    ...overrides,
  };
}

export function defaultParams(overrides: Partial<ReceiptParams> = {}): ReceiptParams {
  return {
    agentId: 1n,
    x402PaymentHash: keccak256(toHex("x402-payment-default")),
    taskHash: keccak256(toHex("task-default")),
    resultHash: keccak256(toHex("result-default")),
    repIdCommitment: keccak256(toHex("repid-commit-default")),
    hal: defaultHAL(),
    humanIdentityRoot: ZERO_BYTES32,
    receiptUriHash: keccak256(toHex("receipt-uri-default")),
    receiptContentHash: keccak256(toHex("receipt-content-default")),
    scoreVersion: 5n,
    nonce: 1n,
    signature: "0x",
    proof: "0x01",
    ...overrides,
  };
}

const HAL_TUPLE = {
  type: "tuple",
  components: [
    { name: "dofVersion", type: "uint8" },
    { name: "outputHash", type: "bytes32" },
    { name: "boundedScore", type: "int128" },
    { name: "commaBftVerdict", type: "uint8" },
    { name: "dimensionsHash", type: "bytes32" },
  ],
} as const;

export function commitHashOf(params: ReceiptParams, committer: Hex): Hex {
  const encoded = encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint8" },
      { type: "bytes32" },
      { type: "int128" },
      { type: "uint8" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" },
      { type: "uint256" },
    ],
    [
      committer,
      params.agentId,
      params.x402PaymentHash,
      params.taskHash,
      params.resultHash,
      params.repIdCommitment,
      params.hal.dofVersion,
      params.hal.outputHash,
      params.hal.boundedScore,
      params.hal.commaBftVerdict,
      params.hal.dimensionsHash,
      params.humanIdentityRoot,
      params.receiptUriHash,
      params.receiptContentHash,
      params.scoreVersion,
      params.nonce,
    ]
  );
  return keccak256(encoded);
}

export function signingDigestOf(params: ReceiptParams): Hex {
  const tag: Hex = pad(toHex("HyperDAGReceipt.v1"), { size: 32 });
  const encoded = encodeAbiParameters(
    [
      { type: "string" },
      { type: "uint256" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" },
    ],
    [
      "HyperDAGReceipt.v1",
      params.agentId,
      params.x402PaymentHash,
      params.taskHash,
      params.resultHash,
      params.repIdCommitment,
      params.hal.outputHash,
      params.receiptContentHash,
      params.nonce,
    ]
  );
  return keccak256(encoded);
}

export async function deployStack(viem: any, ownerAddress: Hex) {
  const verifier = await viem.deployContract("StubRepIDVerifier");
  const idReg = await viem.deployContract("MockERC8004IdentityRegistry");
  const impl = await viem.deployContract("HyperDAGReceiptAdapter");
  const initCalldata = encodeFunctionData({
    abi: impl.abi,
    functionName: "initialize",
    args: [ownerAddress, verifier.address, idReg.address],
  });
  const proxy = await viem.deployContract("ERC1967Proxy", [impl.address, initCalldata]);
  const adapter = await viem.getContractAt("HyperDAGReceiptAdapter", proxy.address);
  return { adapter, verifier, idReg, impl, proxy };
}

export async function mineBlocks(provider: any, n: number) {
  await provider.request({ method: "hardhat_mine", params: [toHex(BigInt(n))] });
}

export function toRevealStruct(p: ReceiptParams) {
  return {
    agentId: p.agentId,
    x402PaymentHash: p.x402PaymentHash,
    taskHash: p.taskHash,
    resultHash: p.resultHash,
    repIdCommitment: p.repIdCommitment,
    hal: {
      dofVersion: p.hal.dofVersion,
      outputHash: p.hal.outputHash,
      boundedScore: p.hal.boundedScore,
      commaBftVerdict: p.hal.commaBftVerdict,
      dimensionsHash: p.hal.dimensionsHash,
    },
    humanIdentityRoot: p.humanIdentityRoot,
    receiptUriHash: p.receiptUriHash,
    receiptContentHash: p.receiptContentHash,
    scoreVersion: p.scoreVersion,
    nonce: p.nonce,
    signature: p.signature,
    proof: p.proof,
  };
}

/// Mirror Solidity behavior: the adapter passes signingDigest to SignatureChecker
/// after wrapping it with MessageHashUtils.toEthSignedMessageHash. For an EOA
/// committer, signing the EIP-191 prefixed digest via walletClient.signMessage
/// with `{ message: { raw: digest } }` is the correct shape.
export async function signParams(walletClient: any, params: ReceiptParams): Promise<Hex> {
  const digest = signingDigestOf(params);
  return walletClient.signMessage({ message: { raw: digest } });
}
