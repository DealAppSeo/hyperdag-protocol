/**
 * Shared setup for integration tests. Loads env from tests/integration/.env.local
 * (gitignored) or falls back to repid-engine/.env (which already has all
 * required keys). Constructs reusable clients lazily so a missing env var only
 * affects the phase that actually needs it.
 *
 * Run individual tests with:
 *   node --experimental-strip-types --no-warnings --test tests/integration/<phase>.test.ts
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JsonRpcProvider, Wallet, Contract, type InterfaceAbi } from "ethers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import IdentityRegistryAbi from "../../packages/contracts/abis/IdentityRegistry.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

// Local override first, then repid-engine .env (already has everything we need).
loadEnvFile(resolve(__dirname, ".env.local"));
loadEnvFile(resolve(__dirname, ".env"));
loadEnvFile(resolve(__dirname, "../../../repid-engine/.env"));

interface EnvConfig {
  baseSepoliaRpcUrl: string | undefined;
  baseSepoliaPrivateKey: string | undefined;
  hyperdagReceiptAdapterAddress: string | undefined;
  erc8004IdentityRegistryAddress: string;
  supabaseUrl: string | undefined;
  supabaseServiceRoleKey: string | undefined;
  anthropicApiKey: string | undefined;
  groqApiKey: string | undefined;
  cerebrasApiKey: string | undefined;
}

export const env: EnvConfig = {
  baseSepoliaRpcUrl: process.env["BASE_SEPOLIA_RPC_URL"],
  baseSepoliaPrivateKey: process.env["BASE_SEPOLIA_PRIVATE_KEY"],
  hyperdagReceiptAdapterAddress: process.env["HYPERDAG_RECEIPT_ADAPTER_ADDRESS"],
  erc8004IdentityRegistryAddress:
    process.env["ERC8004_IDENTITY_REGISTRY_ADDRESS"] ?? "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  supabaseUrl: process.env["SUPABASE_URL"],
  supabaseServiceRoleKey: process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_SERVICE_KEY"],
  anthropicApiKey: process.env["ANTHROPIC_API_KEY"],
  groqApiKey: process.env["GROQ_API_KEY"],
  cerebrasApiKey: process.env["CEREBRAS_API_KEY"],
};

/** Skip helper for tests when an env var is missing — keeps reports honest. */
export function skipIfMissing(...keys: Array<keyof EnvConfig>): { skip: true; reason: string } | null {
  const missing = keys.filter((k) => env[k] == null || env[k] === "");
  if (missing.length === 0) return null;
  return { skip: true, reason: `env not configured: ${missing.join(", ")}` };
}

let _baseSepolia: { provider: JsonRpcProvider; wallet: Wallet } | null = null;
export function baseSepolia(): { provider: JsonRpcProvider; wallet: Wallet } {
  if (_baseSepolia) return _baseSepolia;
  if (!env.baseSepoliaRpcUrl) throw new Error("BASE_SEPOLIA_RPC_URL required");
  if (!env.baseSepoliaPrivateKey) throw new Error("BASE_SEPOLIA_PRIVATE_KEY required");
  const provider = new JsonRpcProvider(env.baseSepoliaRpcUrl);
  const wallet = new Wallet(env.baseSepoliaPrivateKey, provider);
  _baseSepolia = { provider, wallet };
  return _baseSepolia;
}

let _supabase: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  }
  _supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
  return _supabase;
}

/** Returns the deployed ERC-8004 IdentityRegistry contract. */
export function identityRegistry(opts: { withSigner?: boolean } = {}): Contract {
  const { provider, wallet } = baseSepolia();
  const raw = IdentityRegistryAbi as { abi?: unknown[] } | unknown[];
  const abi = (Array.isArray(raw) ? raw : raw.abi) as InterfaceAbi;
  return new Contract(env.erc8004IdentityRegistryAddress, abi, opts.withSigner ? wallet : provider);
}

/** Persist a result JSON next to the tests; returns the absolute path. */
export function captureResult(phase: string, body: Record<string, unknown>): string {
  const dir = resolve(__dirname, "results");
  mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const path = resolve(dir, `${phase}-${ts}.json`);
  const out = { phase, timestamp: new Date().toISOString(), ...body };
  writeFileSync(path, JSON.stringify(out, null, 2));
  return path;
}
