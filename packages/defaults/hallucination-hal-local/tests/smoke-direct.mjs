/**
 * Standalone smoke that loads the deterministic logic directly from src/
 * using a tiny tsc one-shot. No peer deps; no external @hyperdag/* imports
 * needed for the smoke (those are only used by providers.ts and router.ts).
 *
 * Run from the package root:
 *   node tests/smoke-direct.mjs
 *
 * Expected: 4/4 cases produce sane signals + scores matching the
 * src-of-truth in repid-engine/src/hal/lib (byte-equivalent port).
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const srcDir = path.join(pkgRoot, 'src');
const distSmokeDir = path.join(pkgRoot, '.smoke-dist');

// Strip type-only imports + ".js" suffixes to make src directly loadable
// as ESM via dynamic import after compilation. We'll do a minimal tsc.
function ensureClean(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}
ensureClean(distSmokeDir);
fs.mkdirSync(distSmokeDir, { recursive: true });

// Write a one-shot tsconfig so we don't pollute the main config.
const oneShotTs = path.join(pkgRoot, '.tsconfig.smoke.json');
fs.writeFileSync(
  oneShotTs,
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      declaration: false,
      sourceMap: false,
      outDir: '.smoke-dist',
      rootDir: 'src',
      strict: false,
      skipLibCheck: true,
      esModuleInterop: true,
    },
    include: ['src/extract.ts', 'src/score.ts', 'src/constants.ts', 'src/types.ts'],
  }, null, 2)
);

// Use the cc1-mainnet repo's tsc binary (no network install needed).
const tsc = path.resolve(pkgRoot, '..', '..', '..', '..', 'repid-engine-cc1-mainnet', 'node_modules', '.bin', 'tsc.cmd');
const tscArgs = ['--project', '.tsconfig.smoke.json'];

const tscResult = spawnSync(tsc, tscArgs, { cwd: pkgRoot, stdio: 'inherit', shell: true });
if (tscResult.status !== 0) {
  console.error('tsc failed; aborting smoke.');
  process.exit(2);
}

// Now load and run the smoke against the compiled .smoke-dist/
const distMain = path.join(distSmokeDir, 'extract.js');
const distScore = path.join(distSmokeDir, 'score.js');
const distConst = path.join(distSmokeDir, 'constants.js');

const { extractHALSignals } = await import('file:///' + distMain.replace(/\\/g, '/'));
const { computeHALScore } = await import('file:///' + distScore.replace(/\\/g, '/'));
const { HAL_PYTHAGOREAN_COMMA } = await import('file:///' + distConst.replace(/\\/g, '/'));

const cases = [
  { name: 'HIGH RISK — overconfident false CRE claim',
    text: 'LA industrial cap rates definitely compressed 4.8% in 2024, proven fact.', domain: 'cre-underwriting', certainty: 0.95 },
  { name: 'LOW RISK — appropriately hedged CRE claim',
    text: 'Based on CBRE data, industrial cap rates in LA may have compressed approximately 0.5-1.2% in Q3 2024.', domain: 'cre-underwriting', certainty: 0.82 },
  { name: 'HIGH RISK — false technical claim, no hedges',
    text: 'Plonky3 definitely uses BN254 elliptic curve with Groth16, absolutely requires trusted setup.', domain: 'technical', certainty: 0.92 },
  { name: 'LOW RISK — verifiable mathematical truth',
    text: 'The Pythagorean Comma ratio is exactly 531441/524288, approximately 1.01364, representing the gap between twelve perfect fifths and seven octaves.', domain: 'technical', certainty: 0.99 },
];

console.log('\n=== LOCAL HAL SMOKE (deterministic 4-signal + canonical combiner) ===\n');
console.log(`HAL_PYTHAGOREAN_COMMA = ${HAL_PYTHAGOREAN_COMMA}\n`);

for (const c of cases) {
  const s = extractHALSignals({ text: c.text, domain: c.domain, certainty: c.certainty });
  const out = computeHALScore(s);
  console.log(c.name);
  console.log(`  signals: harm=${s.harm_probability.toFixed(3)} epi=${s.epistemic_uncertainty.toFixed(3)} ev=${s.evidence_quality.toFixed(3)} scope=${s.scope_appropriateness.toFixed(3)}`);
  console.log(`  hal_score=${out.hal_score.toFixed(4)} vetoed=${out.vetoed}\n`);
}

// Cleanup
ensureClean(distSmokeDir);
fs.unlinkSync(oneShotTs);
console.log('=== smoke OK ===');
