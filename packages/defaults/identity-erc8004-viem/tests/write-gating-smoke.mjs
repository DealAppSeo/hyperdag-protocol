/**
 * Write-gating smoke — proves the missing-signer / dryRun / mainnet-guard
 * paths all fire correctly without any on-chain broadcast.
 *
 * Compiles src/ once to .smoke-dist/ (uses cc1-mainnet's tsc), then loads
 * the compiled provider and exercises the three error paths.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');

// Cleanup helper
const ensureClean = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} };

const smokeDir = path.join(pkgRoot, '.smoke-dist');
const smokeCfg = path.join(pkgRoot, '.tsconfig.smoke.json');
ensureClean(smokeDir);

fs.writeFileSync(smokeCfg, JSON.stringify({
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    outDir: '.smoke-dist',
    rootDir: 'src',
    strict: false,
    skipLibCheck: true,
    esModuleInterop: true,
    declaration: false,
    sourceMap: false,
  },
  include: ['src/**/*'],
}, null, 2));

const tsc = path.resolve(pkgRoot, '..', '..', '..', '..', 'repid-engine-cc1-mainnet', 'node_modules', '.bin', 'tsc.cmd');
const tscRes = spawnSync(tsc, ['--project', '.tsconfig.smoke.json'], {
  cwd: pkgRoot,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_PATH: path.resolve(pkgRoot, '..', '..', '..', 'node_modules') },
});
if (tscRes.status !== 0) { console.error('tsc failed'); process.exit(2); }

// Add NODE_PATH so viem resolves
process.env.NODE_PATH = path.resolve(pkgRoot, '..', '..', '..', 'node_modules');
const { Module } = await import('node:module');
Module._initPaths();

const distMain = path.join(smokeDir, 'index.js');
const mod = await import('file:///' + distMain.replace(/\\/g, '/'));
const { ViemIdentityProvider, DryRunBlocked, MissingSignerError, MainnetGuardError } = mod;

console.log('\n=== WRITE-GATING SMOKE ===\n');

let pass = 0, fail = 0;
const must = (cond, label) => {
  if (cond) { console.log(`  ✓ ${label}`); pass++; }
  else { console.log(`  ✗ ${label}`); fail++; }
};

// 1. No signer → MissingSignerError on register/transfer
{
  const provider = new ViemIdentityProvider({}); // read-only
  try {
    await provider.register({ metadataUri: 'ipfs://x' });
    must(false, 'register without signer should throw');
  } catch (e) {
    must(e instanceof MissingSignerError, 'register without signer → MissingSignerError');
    must(
      typeof e.message === 'string' && e.message.includes('privateKey'),
      'error mentions privateKey in the one-line example'
    );
  }
}

// 2. Signer + dryRun=true (default) → DryRunBlocked with intended calldata captured
{
  const dummyKey = '0x' + '1'.repeat(64);
  const provider = new ViemIdentityProvider({ privateKey: dummyKey });
  try {
    await provider.register({ metadataUri: 'ipfs://test123' });
    must(false, 'register signer+dryRun should throw');
  } catch (e) {
    must(e instanceof DryRunBlocked, 'register signer+dryRun → DryRunBlocked');
    must(e.intended?.functionName === 'register', 'intended functionName=register');
    must(e.intended?.args?.[0] === 'ipfs://test123', 'intended metadataUri argument captured');
  }
}

// 3. Mainnet without allowMainnet → MainnetGuardError
{
  const dummyKey = '0x' + '1'.repeat(64);
  const provider = new ViemIdentityProvider({
    chainId: 8453,
    privateKey: dummyKey,
    dryRun: false, // explicit broadcast intent
    // allowMainnet omitted
  });
  try {
    await provider.register({ metadataUri: 'ipfs://mainnet' });
    must(false, 'mainnet write without allowMainnet should throw');
  } catch (e) {
    must(e instanceof MainnetGuardError, 'mainnet write without allowMainnet → MainnetGuardError');
  }
}

// 4. dryRun=false + signer + Base Sepolia → would broadcast, so we DON'T do it
//    here. The gating layers above are what protect against unintended fire.
console.log('  (skipped — would broadcast: explicit Sean approval required)');

ensureClean(smokeDir);
try { fs.unlinkSync(smokeCfg); } catch {}

console.log(`\n=== GATING RESULT: ${pass} pass / ${fail} fail ===`);
process.exit(fail === 0 ? 0 : 1);
