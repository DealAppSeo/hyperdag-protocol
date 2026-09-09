#!/usr/bin/env node
//
// check-sdk-claims.mjs — does the README describe the SDK npm actually serves?
//
// WHY THIS EXISTS. This README advertises `@hyperdag/trustshell` and shows call
// sites for it: "Drop-in npm client: `shell.evaluate(...)` for HAL". Nothing tied
// that prose to the package. `shell.evaluate` did not exist on the client at all,
// so a reader following the README got `TypeError: shell.evaluate is not a
// function`, and the README stayed green forever because nothing could disagree
// with it.
//
// THE DISTINCTION THIS CHECK EXISTS TO MAKE, and the one that is easy to miss:
// it compares against the PUBLISHED PACKAGE, not against source. A fix merged to
// the SDK's `main` does NOT make this README true — the README says "npm
// install", so what npm serves is what a reader gets. A method can be real in
// git and absent for every user, and that gap is invisible from either repo
// alone. (Observed exactly that way on 2026-09-04: `evaluate` merged to the SDK's
// main while npm still served 1.3.0 without it.)
//
// THREE OUTCOMES. 0 VERIFIED · 2 NOT_CHECKED · 1 FAILED. A registry we could not
// reach is NOT_CHECKED, never FAILED and never a pass: this check's whole job is
// to know what npm serves, so not knowing is not a verdict. That direction has
// already cost this ecosystem real time — a guard that reports FAILED when it
// simply could not look teaches readers its red is noise.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PKG = '@hyperdag/trustshell';
const README = join(import.meta.dirname, '..', 'README.md');

function notChecked(why, detail) {
  console.log('check:sdk-claims — NOT_CHECKED');
  console.log(`  ${why}`);
  if (detail) console.log(`  ${detail}`);
  console.log('  This says NOTHING about the README. Re-run where npm is reachable.');
  process.exit(2);
}

// ---- what the README claims -------------------------------------------------
const readme = readFileSync(README, 'utf8');
const claimed = [
  ...new Set(
    [...readme.matchAll(/\b(?:shell|client)\.([a-zA-Z][a-zA-Z0-9]*)\s*\(/g)].map((m) => m[1])
  ),
];

if (claimed.length === 0) {
  // Not a pass. If the README stopped showing call sites, this check has nothing
  // to compare and should say so rather than reporting a clean bill of health.
  notChecked('the README contains no `shell.<method>(` call sites to check');
}

// ---- what npm actually serves ----------------------------------------------
const work = mkdtempSync(join(tmpdir(), 'sdk-claims-'));
let dts;
try {
  execFileSync('npm', ['pack', PKG, '--silent'], { cwd: work, stdio: ['ignore', 'pipe', 'pipe'] });
  const tgz = readdirSync(work).find((f) => f.endsWith('.tgz'));
  if (!tgz) throw new Error('npm pack produced no tarball');
  execFileSync('tar', ['-xzf', tgz], { cwd: work });
  dts = readFileSync(join(work, 'package', 'dist', 'lib', 'trustshell.d.ts'), 'utf8');
} catch (err) {
  rmSync(work, { recursive: true, force: true });
  notChecked(`could not fetch ${PKG} from npm`, String(err?.message ?? err).split('\n')[0]);
}

const version = (() => {
  try {
    return JSON.parse(readFileSync(join(work, 'package', 'package.json'), 'utf8')).version;
  } catch {
    return 'unknown';
  }
})();

// Method names as they appear on the declared class surface.
const published = new Set(
  [...dts.matchAll(/^\s{4}(?:readonly\s+)?([a-zA-Z][a-zA-Z0-9]*)\s*[(<]/gm)].map((m) => m[1])
);
rmSync(work, { recursive: true, force: true });

if (published.size < 5) {
  notChecked(
    `parsed only ${published.size} methods from ${PKG}@${version} — the .d.ts shape probably moved`,
    'Refusing to report a pass or a failure off a parse that clearly did not work.'
  );
}

// ---- compare ----------------------------------------------------------------
const phantom = claimed.filter((m) => !published.has(m));

if (phantom.length > 0) {
  console.log('check:sdk-claims — FAILED');
  console.log(`  README.md advertises ${phantom.length} method(s) that ${PKG}@${version} does not expose:`);
  for (const m of phantom) console.log(`    ✗ shell.${m}(...)`);
  console.log('');
  console.log(`  A reader following this README with \`npm install ${PKG}\` gets a TypeError.`);
  console.log('  If the method exists on the SDK\'s main branch, it is NOT published yet —');
  console.log('  merging is not shipping, and this README points at npm. Publish, or');
  console.log('  change the README to describe the version people can actually install.');
  console.log(`  Published surface: ${[...published].sort().join(', ')}`);
  process.exit(1);
}

console.log('check:sdk-claims — VERIFIED');
console.log(`  ${claimed.length} README call site(s) all exist on ${PKG}@${version}: ${claimed.sort().join(', ')}`);
