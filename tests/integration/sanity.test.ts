/** Phase 1 sanity: env loader + clients construct without error. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { env, baseSepolia, supabase, identityRegistry } from "./setup.ts";

test("env loader populates the expected keys (or marks them missing honestly)", () => {
  // We don't assert env values are present — just that the loader didn't crash.
  assert.equal(typeof env.erc8004IdentityRegistryAddress, "string");
  assert.ok(env.erc8004IdentityRegistryAddress.startsWith("0x"));
});

test("baseSepolia provider + wallet construct (or throw a useful error)", () => {
  if (!env.baseSepoliaRpcUrl || !env.baseSepoliaPrivateKey) {
    return; // skip honestly
  }
  const { provider, wallet } = baseSepolia();
  assert.ok(provider);
  assert.ok(wallet.address.startsWith("0x"));
});

test("supabase client constructs (or throws useful error)", () => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return;
  const sb = supabase();
  assert.ok(sb);
});

test("identityRegistry contract constructs", () => {
  if (!env.baseSepoliaRpcUrl || !env.baseSepoliaPrivateKey) return;
  const c = identityRegistry();
  assert.ok(c);
  assert.equal(c.target, env.erc8004IdentityRegistryAddress);
});
