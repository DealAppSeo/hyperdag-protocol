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

if (!builders.includes('PUBLISHED — `1.6.0`')) {
  fail('BUILDERS.md does not name published @hyperdag/trustshell 1.6.0');
}
if (/PUBLISHED — `1\.4\.0`/.test(builders)) {
  fail('BUILDERS.md still names 1.4.0 as the published package');
}
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
if (version !== '1.6.0') {
  fail(`npm view @hyperdag/trustshell version is ${version}, and BUILDERS.md says 1.6.0`);
}

console.log('check:builders — VERIFIED');
console.log('  BUILDERS.md names 1.6.0, exit 2 on NOT_CHECKED, and the optional ethers peer');
