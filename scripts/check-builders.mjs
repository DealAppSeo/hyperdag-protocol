#!/usr/bin/env node
/**
 * BUILDERS.md is the contract an outside developer is told to trust.
 * It must name the trustshell version npm serves, say an unavailable check
 * exits 2 and is never a pass, and name what the optional ethers peer is for.
 *
 * 0 VERIFIED · 1 FAILED · 2 NOT_CHECKED. A registry we could not reach is
 * NOT_CHECKED, never a pass.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOC = join(import.meta.dirname, '..', 'BUILDERS.md');
const builders = readFileSync(DOC, 'utf8').replace(/\r/g, '');

function fail(why) {
  console.log('check:builders — FAILED');
  console.log(`  ${why}`);
  process.exit(1);
}

function notChecked(why) {
  console.log('check:builders — NOT_CHECKED');
  console.log(`  ${why}`);
  console.log('  This says NOTHING about the file. Re-run where npm is reachable.');
  process.exit(2);
}

// The version is read FROM the doc, not written here. This file used to hardcode `1.6.0` twice,
// so publishing 1.6.1 turned every PR in this repo red until someone edited the CHECKER, which is
// the wrong file: the doc is what an outsider reads. Now a publish still turns CI red until
// BUILDERS.md names the new version, and the check itself never needs touching.
const named = [...builders.matchAll(/PUBLISHED — `(\d+\.\d+\.\d+)`/g)].map((m) => m[1]);
if (named.length !== 1) {
  fail(`BUILDERS.md must name exactly one published @hyperdag/trustshell version; it names ${named.length}`);
}
const documented = named[0];
if (!builders.includes('exits 0 on PASS or FLAG, 1 on VETO, and 2 when HAL did not decide (NOT_CHECKED, never a pass)')) {
  fail('BUILDERS.md does not say NOT_CHECKED exits 2 and is never a pass');
}
if (!builders.includes('`ethers` (`^6`) is an optional peer')) {
  fail('BUILDERS.md does not say ethers is an optional peer');
}
if (!builders.includes('buildX402Payment') || !builders.includes('verifySigner')) {
  fail('BUILDERS.md does not name both published uses of ethers: payment signing and verifySigner');
}
if (/only for payment signing/.test(builders)) {
  fail('BUILDERS.md says ethers is only for payment signing');
}

let version;
try {
  const bin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  version = execFileSync(bin, ['view', '@hyperdag/trustshell', 'version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    windowsHide: true,
  }).trim();
} catch (err) {
  notChecked(`npm view did not answer: ${String(err?.message ?? err).split('\n')[0]}`);
}
if (version !== documented) {
  fail(`npm view @hyperdag/trustshell version is ${version}, and BUILDERS.md says ${documented}`);
}

console.log('check:builders — VERIFIED');
console.log(`  BUILDERS.md names ${documented} (= npm), exit 2 on NOT_CHECKED, and the optional ethers peer`);
