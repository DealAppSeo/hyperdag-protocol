/**
 * Phase 3 — IReputation against the live Trinity Supabase RepID tables.
 *
 * The kernel's IReputation interface uses AgentId = bigint (matching ERC-8004
 * token ids). Trinity Supabase identifies agents by repid_agents.id (uuid)
 * with repid_agents.canonical_agent_id (text) as the bigint-friendly bridge.
 * This test wires a Trinity-backed IReputation impl that uses
 * canonical_agent_id as the lookup key.
 *
 * Schema verified at sprint start (CLAUDE-RULE-5):
 *   repid_agents:        id uuid, canonical_agent_id text, agent_name text,
 *                        current_repid integer, tier text, ...
 *   repid_score_events:  id, agent_id (uuid), event_type, delta,
 *                        repid_before, repid_after, created_at, ...
 *
 * SOPHIA: id=f3ef0bf8-5cdc-4fad-bce8-5144f01dc271, canonical_agent_id="625",
 *         current_repid=10000, tier=AUTONOMOUS.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import type {
  IReputation,
  AgentId,
  Feedback,
  FeedbackReceipt,
  RepIDScore,
  ZKProof,
} from "@hyperdag/interfaces";
import { captureResult, env, skipIfMissing, supabase } from "./setup.ts";

const PHASE = "reputation";

class TrinityReputationProvider implements IReputation {
  async getScore(agentId: AgentId): Promise<RepIDScore> {
    const sb = supabase();
    const { data, error } = await sb
      .from("repid_agents")
      .select("id, current_repid, tier, last_updated, last_active_at")
      .eq("canonical_agent_id", agentId.toString())
      .maybeSingle();
    if (error) throw new Error(`getScore: ${error.message}`);
    if (!data) throw new Error(`getScore: no agent with canonical_agent_id=${agentId}`);
    const ts = data.last_active_at ?? data.last_updated ?? new Date().toISOString();
    return {
      agentId,
      score: data.current_repid,
      tier: data.tier,
      updatedAt: Math.floor(new Date(ts).getTime() / 1000),
    };
  }

  async submitFeedback(agentId: AgentId, feedback: Feedback): Promise<FeedbackReceipt> {
    const sb = supabase();
    // Look up the uuid for this canonical id
    const { data: agent, error } = await sb
      .from("repid_agents")
      .select("id")
      .eq("canonical_agent_id", agentId.toString())
      .maybeSingle();
    if (error) throw new Error(`submitFeedback lookup: ${error.message}`);
    if (!agent) throw new Error(`submitFeedback: no agent with canonical_agent_id=${agentId}`);

    const contentHash = ("0x" + simpleHash(`${feedback.from}|${feedback.body}|${JSON.stringify(feedback.context ?? {})}`)) as `0x${string}`;
    // Trinity Supabase event_type CHECK constraint: AGENT_TEACHING,
    // CHALLENGE_DRAW, CHALLENGE_LOSS, CHALLENGE_WIN, EPISTEMIC_VIOLATION,
    // GENESIS, PEACEMAKER, PREDICTION_RESOLVE. Map IReputation.submitFeedback
    // to AGENT_TEACHING (passive feedback contributing to future updates).
    const { data: inserted, error: insErr } = await sb
      .from("repid_score_events")
      .insert({
        agent_id: agent.id,
        event_type: "AGENT_TEACHING",
        delta: feedback.signal ?? 0,
        repid_before: 0,
        repid_after: 0,
        metadata: { from: feedback.from, body: feedback.body.slice(0, 500), context: feedback.context, contentHash },
      })
      .select("id")
      .single();
    if (insErr) throw new Error(`submitFeedback insert: ${insErr.message}`);
    return {
      receiptId: String(inserted.id),
      agentId,
      contentHash,
    };
  }

  async verifyProof(_proof: ZKProof): Promise<boolean> {
    // Stub — Trinity production verifier lives in repid-engine; out of scope.
    return false;
  }

  async getReputationProof(_agentId: AgentId): Promise<ZKProof> {
    throw new Error("TrinityReputationProvider.getReputationProof not implemented in v0.1 wiring");
  }
}

function simpleHash(s: string): string {
  let h = 0xdead_beef;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
  return ((h >>> 0).toString(16).padStart(8, "0")).repeat(8);
}

const results: {
  sophia?: { agentId: string; score: number; tier?: string };
  unknown_agent_behavior?: string;
  test_agent?: { id: string; canonical_agent_id: string; agent_name: string };
  feedback_receipt?: { receiptId: string; contentHash: string };
  recent_history_count?: number;
} = {};

const TEST_AGENT_CANONICAL_ID = `8888${Math.floor(Date.now() / 1000) % 100000}`;

test("Phase 3.1 — IReputation.getScore() reads SOPHIA (canonical_agent_id=625)", async () => {
  const skip = skipIfMissing("supabaseUrl", "supabaseServiceRoleKey");
  if (skip) {
    console.log("SKIP:", skip.reason);
    return;
  }
  const reputation = new TrinityReputationProvider();
  const score = await reputation.getScore(625n);
  assert.equal(score.agentId, 625n);
  assert.equal(score.score, 10000, "SOPHIA RepID is the cap value 10000");
  assert.equal(score.tier, "AUTONOMOUS");
  results.sophia = { agentId: score.agentId.toString(), score: score.score, tier: score.tier };
});

test("Phase 3.2 — IReputation.getScore() on unknown agent throws clearly", async () => {
  const skip = skipIfMissing("supabaseUrl", "supabaseServiceRoleKey");
  if (skip) return;
  const reputation = new TrinityReputationProvider();
  let threw = false;
  let msg = "";
  try {
    await reputation.getScore(99_999_999n);
  } catch (e) {
    threw = true;
    msg = (e as Error).message;
  }
  assert.equal(threw, true);
  assert.ok(msg.includes("99999999") || msg.includes("no agent"), `informative error; got: ${msg}`);
  results.unknown_agent_behavior = msg.slice(0, 100);
});

test("Phase 3.3 — create a TEST agent, then exercise getScore + submitFeedback", async () => {
  const skip = skipIfMissing("supabaseUrl", "supabaseServiceRoleKey");
  if (skip) return;
  const sb = supabase();

  // Create a clean test agent (timestamped canonical id avoids collision)
  const { data: created, error: createErr } = await sb
    .from("repid_agents")
    .insert({
      agent_name: `CC2-INT-${Date.now()}`,
      canonical_agent_id: TEST_AGENT_CANONICAL_ID,
      // NOT NULL constraint — use a unique deterministic placeholder per run
      erc8004_address: `0xCC2INT${Date.now().toString(16).padStart(34, "0").slice(0, 34)}`,
      current_repid: 1500,
      tier: "EARNING_AUTONOMY",
      activity_30d: 0,
      validation_count: 0,
      validations_correct: 0,
    })
    .select("id, agent_name, canonical_agent_id")
    .single();
  if (createErr) throw new Error(`create test agent: ${createErr.message}`);
  results.test_agent = created;

  const reputation = new TrinityReputationProvider();
  const score = await reputation.getScore(BigInt(TEST_AGENT_CANONICAL_ID));
  assert.equal(score.score, 1500);
  assert.equal(score.tier, "EARNING_AUTONOMY");

  const receipt = await reputation.submitFeedback(BigInt(TEST_AGENT_CANONICAL_ID), {
    from: "0xdf6b8215d193b11b4903d223729c3cf7a6de271d",
    body: "Phase 3.3 integration test feedback — safe to ignore.",
    signal: 1,
    context: { runAt: new Date().toISOString(), test: "phase-3.3" },
  });
  assert.ok(receipt.receiptId);
  assert.ok(receipt.contentHash.startsWith("0x"));
  assert.equal(receipt.agentId, BigInt(TEST_AGENT_CANONICAL_ID));
  results.feedback_receipt = { receiptId: receipt.receiptId, contentHash: receipt.contentHash };
});

test("Phase 3.4 — read recent score history for SOPHIA", async () => {
  const skip = skipIfMissing("supabaseUrl", "supabaseServiceRoleKey");
  if (skip) return;
  const sb = supabase();
  const { data, error } = await sb
    .from("repid_score_events")
    .select("id, event_type, delta, repid_before, repid_after, created_at")
    .eq("agent_id", "f3ef0bf8-5cdc-4fad-bce8-5144f01dc271") // SOPHIA's uuid
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0, "SOPHIA should have at least 1 historical event");
  results.recent_history_count = data.length;
});

test("Phase 3.5 — capture results", () => {
  const path = captureResult(PHASE, results);
  console.log(`captured: ${path}`);
});
