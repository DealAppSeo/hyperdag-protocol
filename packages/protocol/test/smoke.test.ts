/**
 * Smoke test for @hyperdag/protocol — verifies the wiring, not the network.
 *
 * Uses Node's built-in test runner + node:assert (matches packages/contracts/
 * convention). All external dependencies are mocked.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createHDP,
  ERC8004IdentityProvider,
  type IIdentity,
  type AgentId,
  type Address,
  type ERC8004ContractClient,
} from "../dist/index.js";

test("createHDP() returns a fully-wired HDP instance with stub fallbacks", async () => {
  const hdp = createHDP({});
  assert.equal(hdp.identity, undefined, "no erc8004Client passed → identity is undefined");
  assert.ok(hdp.reputation, "reputation provider present");
  assert.ok(hdp.validation, "validation provider present");
  assert.ok(hdp.payment, "payment provider present");
  assert.ok(hdp.linkage, "linkage provider present");
  assert.ok(hdp.hallucination, "hallucination provider present");
});

test("hdp.hallucination.evaluate() returns the canonical HALResult shape (stub)", async () => {
  const hdp = createHDP({});
  const result = await hdp.hallucination.evaluate({
    prompt: "What's the capital of France?",
    output: "Paris.",
    context: { agentId: 3749 },
  });
  assert.equal(typeof result.hal_score, "number");
  assert.equal(typeof result.vetoed, "boolean");
  assert.equal(typeof result.comma_veto, "boolean");
  assert.equal(typeof result.comma_gap, "number");
  assert.equal(result.formula, "stub", "without an apiUrl, evaluate falls back to the stub formula");
  // 6-DOF signal block
  assert.equal(typeof result.signals.faithfulness, "number");
  assert.equal(typeof result.signals.contradiction, "number");
  assert.equal(typeof result.signals.calibration, "number");
  assert.equal(typeof result.signals.relevance, "number");
  assert.equal(typeof result.signals.coherence, "number");
  assert.equal(typeof result.signals.consensus, "number");
});

test("hdp.hallucination.getCommaThreshold() returns Pythagorean Comma by default", async () => {
  const hdp = createHDP({});
  const threshold = await hdp.hallucination.getCommaThreshold();
  assert.ok(Math.abs(threshold - 1.013643) < 0.001, `expected ~1.013643, got ${threshold}`);
});

test("ERC8004IdentityProvider.resolve() works with a mocked contract client", async () => {
  const mockClient: ERC8004ContractClient = {
    async readAgent(agentId: AgentId) {
      return {
        owner: "0x0000000000000000000000000000000000001234" as Address,
        metadataUri: `ipfs://meta/${agentId.toString()}`,
      };
    },
    async register() {
      throw new Error("not used");
    },
    async transfer() {
      throw new Error("not used");
    },
  };
  const identity: IIdentity = new ERC8004IdentityProvider({ client: mockClient });
  const file = await identity.resolve(3749n);
  assert.equal(file.agentId, 3749n);
  assert.equal(file.owner, "0x0000000000000000000000000000000000001234");
  assert.equal(file.metadataUri, "ipfs://meta/3749");
  assert.equal(file.chainId, 84532, "default chain id is Base Sepolia");
});

test("hdp.validation.requestValidation() honors the repIdGate (HITL graduation)", async () => {
  const hdp = createHDP({ hitlGate: 70 });
  const lowRep = await hdp.validation.requestValidation(
    { contentHash: "0xabcd" },
    50, // below the gate
  );
  assert.equal(lowRep.awaitingHuman, true, "low RepID submitter routed through human review");
  assert.equal(lowRep.status, "queued");

  const highRep = await hdp.validation.requestValidation(
    { contentHash: "0xabcd" },
    8500, // well above the gate
  );
  assert.equal(highRep.awaitingHuman, false, "high RepID submitter proceeds to in_progress");
  assert.equal(highRep.status, "in_progress");
});

test("hdp.linkage.requiredStake() decreases as RepID grows (inverse-stake curve)", async () => {
  const hdp = createHDP({});
  // Default lookup returns 0 for any human, so requiredStake will be the
  // BASE_STAKE — but we can verify the curve directly by injecting a lookup.
  const fakeLookup = async (h: string) => {
    if (h === "low") return 100;
    if (h === "high") return 9000;
    return 0;
  };
  const { LinkageRegistryProvider } = await import("../dist/index.js");
  const linkage = new LinkageRegistryProvider({ humanRepIdLookup: fakeLookup });
  const lowStake = await linkage.requiredStake("low");
  const highStake = await linkage.requiredStake("high");
  assert.ok(highStake < lowStake, `inverse-stake: high-rep stake (${highStake}) < low-rep stake (${lowStake})`);
});

test("hdp.payment.createPaymentRequired() builds an x402-shaped envelope", async () => {
  const hdp = createHDP({});
  const required = await hdp.payment.createPaymentRequired(
    1_000_000n,
    "0x000000000000000000000000000000000000beef" as Address,
    "/api/v1/tip/deliver/abc",
  );
  assert.equal(required.scheme, "exact");
  assert.equal(required.network, "base-sepolia");
  assert.equal(required.chainId, 84532);
  assert.equal(required.maxAmountRequired, 1_000_000n);
  assert.equal(required.payTo, "0x000000000000000000000000000000000000beef");
  assert.equal(required.resource, "/api/v1/tip/deliver/abc");
});
