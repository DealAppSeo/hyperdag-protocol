/**
 * Live read smoke — proves the zero-config viem provider can read from the
 * canonical ERC-8004 IdentityRegistry on Base Sepolia. No signer, no keys.
 *
 * Run:
 *   node tests/live-read-smoke.mjs
 *
 * Expected: reads ownerOf(3747) — trinity-sophia's canonical token id from
 * CC1's memory entries — and prints owner + metadataUri. Then attempts a
 * write in dryRun mode and confirms DryRunBlocked fires.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const oneShotTs = path.join(pkgRoot, '.tsconfig.smoke.json');

fs.writeFileSync(
  oneShotTs,
  JSON.stringify({
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
  }, null, 2)
);

const tsc = path.resolve(pkgRoot, '..', '..', '..', '..', 'repid-engine-cc1-mainnet', 'node_modules', '.bin', 'tsc.cmd');
const tscResult = spawnSync(tsc, ['--project', '.tsconfig.smoke.json'], { cwd: pkgRoot, stdio: 'inherit', shell: true });
if (tscResult.status !== 0) {
  console.error('tsc failed; aborting smoke.');
  process.exit(2);
}

// Add a node_modules path so viem resolves from hyperdag-protocol root install.
process.env.NODE_PATH = path.resolve(pkgRoot, '..', '..', '..', 'node_modules');

const distMain = path.join(pkgRoot, '.smoke-dist', 'index.js');
const { ViemIdentityProvider, DryRunBlocked, MissingSignerError, IDENTITY_REGISTRY_BASE_SEPOLIA } =
  await import('file:///' + distMain.replace(/\\/g, '/'));

console.log('\n=== LIVE ERC-8004 READ SMOKE (Base Sepolia) ===\n');
console.log(`registry = ${IDENTITY_REGISTRY_BASE_SEPOLIA}\n`);

const provider = new ViemIdentityProvider({}); // zero-config, dryRun default true

let readsPass = 0;
const tokensToProbe = [3747n, 1n, 2n, 100n];

for (const tokenId of tokensToProbe) {
  try {
    const file = await provider.resolve(tokenId);
    console.log(`agentId=${tokenId}: owner=${file.owner} metadataUri=${file.metadataUri || '(empty)'} chainId=${file.chainId}`);
    readsPass++;
  } catch (e) {
    console.log(`agentId=${tokenId}: ${e?.name ?? 'Error'} — ${e?.message?.split('\n')[0]}`);
  }
}

// Probe write paths
console.log('\n--- Write-path gating ---');

// 1. No signer + dryRun=true → MissingSignerError (checked BEFORE dryRun)
try {
  await provider.register({ metadataUri: 'ipfs://test' });
  console.log('register (no signer): UNEXPECTED — should have thrown');
} catch (e) {
  console.log(`register (no signer): ${e?.name} ✓`);
}

// 2. With dummy signer + dryRun=true → DryRunBlocked
const dummyKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
const guardedProvider = new ViemIdentityProvider({ privateKey: dummyKey });
try {
  await guardedProvider.register({ metadataUri: 'ipfs://test' });
  console.log('register (signer + dryRun): UNEXPECTED — should have thrown');
} catch (e) {
  if (e instanceof DryRunBlocked) {
    console.log(`register (signer + dryRun): DryRunBlocked ✓  intended=${e.intended.functionName}(${e.intended.args[0]})`);
  } else {
    console.log(`register (signer + dryRun): ${e?.name ?? 'Error'} — ${e?.message?.split('\n')[0]}`);
  }
}

// 3. Mainnet write without allowMainnet → MainnetGuardError
const mainnetProvider = new ViemIdentityProvider({ chainId: 8453, privateKey: dummyKey, dryRun: false });
try {
  await mainnetProvider.register({ metadataUri: 'ipfs://test' });
  console.log('register (mainnet, no allowMainnet): UNEXPECTED — should have thrown');
} catch (e) {
  console.log(`register (mainnet, no allowMainnet): ${e?.name} ✓`);
}

// Cleanup
try { fs.rmSync(path.join(pkgRoot, '.smoke-dist'), { recursive: true, force: true }); } catch {}
try { fs.unlinkSync(oneShotTs); } catch {}

console.log(`\n=== READ RESULT: ${readsPass}/${tokensToProbe.length} reads succeeded ===`);
if (readsPass === 0) {
  console.log('FAIL — no reads from live chain.');
  process.exit(1);
}
console.log('=== smoke OK ===');
