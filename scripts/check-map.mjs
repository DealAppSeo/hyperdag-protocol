#!/usr/bin/env node
/**
 * check:map — BUILDERS.md "How the pieces fit" is the one map of which repo
 * calls which. Other repos link to its anchor. This check pins the map's EDGES
 * to the code that makes them, not to a picture: a URL or package name in the
 * map that no longer matches the code means the map is wrong, and a reader
 * wiring against it is wrong with it.
 *
 * In this repo (always run):
 *   - BUILDERS.md has the heading `## How the pieces fit` and states the edges.
 *   - README.md has `## Where this sits`, linking to the map's real anchor.
 *   - No file here says the ERC-8004 registries are operated by HyperDAG.
 *     They are the ERC-8004 team's deployments; we document and use them.
 *
 * Against sibling checkouts (each one is its own half). The URLs and package
 * names are READ FROM THE MAP, never repeated here, so editing the map is what
 * gets checked:
 *   - repid-engine: every *.up.railway.app host its src names is the map's
 *     engine or prover, and it names both; it names the controller link; it
 *     depends on the map's proof-verifier package; it posts to the prover route.
 *   - trustshell: its package name is the map's; it depends on proof-verifier;
 *     every *.up.railway.app host its SDK, CLI and MCP server name is the map's
 *     engine; the extension may reach only the engine.
 *   - HyperDAG-core: services/zkp-postcard serves the route the engine posts to.
 *   - trinity-symphony-shared: the house agents name the map's engine URL.
 *
 * Siblings are looked for beside this repo, or under $HYPERDAG_SIBLINGS_DIR
 * (CI checks them out there). An absent sibling is NOT_CHECKED for its half:
 * not being able to look is not a verdict about the map.
 *
 * 0 VERIFIED · 1 FAILED · 2 NOT_CHECKED.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SIBLINGS = resolve(process.env.HYPERDAG_SIBLINGS_DIR || join(ROOT, '..'));
const SELF = resolve(import.meta.filename);

const failures = [];
const notChecked = [];
const verified = [];

const read = (p) => readFileSync(p, 'utf8').replace(/\r/g, '');
const origin = (u) => new URL(u).origin;

// ---------------------------------------------------------------- the map ---
const builders = read(join(ROOT, 'BUILDERS.md'));
const MAP_HEADING = '## How the pieces fit';
const headingLines = builders.split('\n').filter((l) => l.trim() === MAP_HEADING);

function fatal(why) {
  console.log('check:map — FAILED');
  console.log(`  ${why}`);
  process.exit(1);
}

if (headingLines.length !== 1) {
  fatal(`BUILDERS.md must have exactly one \`${MAP_HEADING}\` heading (found ${headingLines.length}); other repos link to its anchor`);
}
const mapStart = builders.indexOf(`\n${MAP_HEADING}\n`) + 1;
const afterHeading = builders.slice(mapStart + MAP_HEADING.length);
const nextSection = afterHeading.search(/\n## /);
const map = nextSection === -1 ? afterHeading : afterHeading.slice(0, nextSection);

// Bullets, with their wrapped continuation lines joined on.
const bullets = [];
for (const line of map.split('\n')) {
  if (/^- /.test(line)) bullets.push(line.slice(2));
  else if (/^\s+\S/.test(line) && bullets.length) bullets[bullets.length - 1] += ' ' + line.trim();
}
const bulletWith = (needle) => bullets.find((b) => b.includes(needle));
const urlsIn = (text) => [...(text ?? '').matchAll(/https:\/\/[^\s`)\]]+/g)].map((m) => m[0].replace(/[.,;]+$/, ''));
const runtimeUrl = (text) => urlsIn(text).find((u) => !/^https:\/\/github\.com\//.test(u));
const pkgIn = (text) => (text ?? '').match(/`(@hyperdag\/[a-z0-9-]+)`/)?.[1];

const engineBullet = bulletWith('github.com/DealAppSeo/repid-engine');
const trustshellBullet = bulletWith('github.com/DealAppSeo/trustshell');
const verifierBullet = bulletWith('github.com/DealAppSeo/hyperdag-proof-verifier');
const coreBullet = bulletWith('github.com/DealAppSeo/HyperDAG-core');
const registriesBullet = bulletWith('registries on Base Sepolia');
const engineEdge = bullets.find((b) => /^the engine →/.test(b));

const ENGINE = runtimeUrl(engineBullet);
const PROVER = runtimeUrl(coreBullet);
const CONTROLLER = runtimeUrl(engineEdge);
const TRUSTSHELL_PKG = pkgIn(trustshellBullet);
const VERIFIER_PKG = pkgIn(verifierBullet);

const missing = Object.entries({
  'the engine URL (repid-engine bullet)': ENGINE,
  'the prover URL (HyperDAG-core bullet)': PROVER,
  'the controller link (the engine → edge)': CONTROLLER,
  'the trustshell package (trustshell bullet)': TRUSTSHELL_PKG,
  'the proof-verifier package (hyperdag-proof-verifier bullet)': VERIFIER_PKG,
}).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) failures.push(`the map no longer states ${missing.join('; ')}`);

const EDGES = [
  /^trustshell → .*engine.*proof-verifier.*ReputationRegistry/,
  /^the engine → .*prover.*proof-verifier.*registries/,
  /^the house agents → .*engine/,
  /^nothing else → the house agents/,
  /^this repository → nothing at runtime/,
];
for (const edge of EDGES) {
  if (!bullets.some((b) => edge.test(b))) failures.push(`the map does not state the edge ${edge}`);
}
if (!registriesBullet || !/ERC-8004 team's/.test(registriesBullet) || !/do not operate them/.test(registriesBullet)) {
  failures.push('the map does not say the registries are the ERC-8004 team\'s deployments that we do not operate');
}

// -------------------------------------------------------------- README.md ---
const readme = read(join(ROOT, 'README.md'));
// GitHub's anchor for a heading: lowercase, punctuation dropped, spaces to hyphens.
const anchor = MAP_HEADING.slice(3).toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replace(/ /g, '-');
const whereAt = readme.split('\n').findIndex((l) => l.trim() === '## Where this sits');
if (whereAt === -1) {
  failures.push('README.md has no `## Where this sits` section');
} else {
  const rest = readme.split('\n').slice(whereAt + 1);
  const end = rest.findIndex((l) => /^(## |---\s*$)/.test(l));
  const where = rest.slice(0, end === -1 ? undefined : end).join('\n');
  const links = [...where.matchAll(/\]\(BUILDERS\.md#([^)]*)\)/g)].map((m) => m[1]);
  if (!links.includes(anchor)) failures.push(`README.md "Where this sits" does not link to BUILDERS.md#${anchor}`);
  const wrong = links.filter((l) => l !== anchor);
  if (wrong.length) failures.push(`README.md "Where this sits" links to a map anchor that does not exist: #${wrong.join(', #')}`);
}

// ----------------------------------------- who operates the registries ------
const OPERATED = /operated\s+by\s+(the\s+)?hyperdag/i;
const TEXT = /\.(md|ts|tsx|js|mjs|cjs|json|sol|ya?ml|txt|svg)$/i;
const SKIP = new Set(['node_modules', '.git', '__tests__', 'dist', '.next']);
function walk(dir, keep, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    // CI checks the siblings out INSIDE this workspace; they are not this repo's files.
    if (SKIP.has(name) || resolve(p) === SIBLINGS) continue;
    let s;
    try { s = statSync(p); } catch { continue; } // a dangling link is not a file to read
    if (s.isDirectory()) walk(p, keep, out);
    else if (keep(p)) out.push(p);
  }
  return out;
}
for (const file of walk(ROOT, (p) => TEXT.test(p) && resolve(p) !== SELF)) {
  if (OPERATED.test(read(file))) failures.push(`${relative(ROOT, file)} says the registries are operated by HyperDAG; they are the ERC-8004 team's`);
}
const constantsFile = join(ROOT, 'packages/defaults/identity-erc8004-viem/src/constants.ts');
if (!existsSync(constantsFile)) {
  failures.push(`${relative(ROOT, constantsFile)} is gone; point this check at wherever the registry constants moved`);
} else if (!/ERC-8004 team's canonical/.test(read(constantsFile))) {
  failures.push(`${relative(ROOT, constantsFile)} no longer says the registries are the ERC-8004 team's canonical deployments`);
}

// --------------------------------------------------------- the siblings ----
function sibling(...names) {
  for (const n of names) {
    const p = join(SIBLINGS, n);
    if (existsSync(p)) return p;
  }
  return null;
}
const RAILWAY = /['"`](https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.up\.railway\.app)/gi;
const hostsIn = (files, re) => new Set(files.flatMap((f) => [...read(f).matchAll(re)].map((m) => origin(m[1]))));
const sources = (dir, ext = /\.(ts|tsx|js|mjs|cjs)$/) => (existsSync(dir) ? walk(dir, (p) => ext.test(p)) : []);
const depsOf = (pkg) => ({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies, ...pkg.optionalDependencies });

function half(name, dir, body) {
  if (missing.length) return; // the map itself could not be read; already FAILED above
  if (!dir) {
    notChecked.push(`${name}: no checkout under ${SIBLINGS}`);
    return;
  }
  const before = failures.length;
  body(dir);
  if (failures.length === before) verified.push(name);
}

half('repid-engine', sibling('repid-engine'), (dir) => {
  const src = sources(join(dir, 'src'));
  if (src.length === 0) return failures.push(`repid-engine: no source under ${join(dir, 'src')}, so nothing could be compared`);
  const hosts = hostsIn(src, RAILWAY);
  if (!hosts.has(origin(ENGINE))) failures.push(`repid-engine: its src never names the map's engine ${origin(ENGINE)}`);
  if (!hosts.has(origin(PROVER))) failures.push(`repid-engine: its src never names the map's prover ${origin(PROVER)}`);
  const unmapped = [...hosts].filter((h) => h !== origin(ENGINE) && h !== origin(PROVER));
  if (unmapped.length) failures.push(`repid-engine: calls ${unmapped.join(', ')}, which the map does not name`);
  const ctl = hostsIn(src, /['"`](https:\/\/[a-z0-9.-]*aitrinitysymphony\.com)/gi);
  if (!ctl.has(origin(CONTROLLER))) failures.push(`repid-engine: its src never names the map's controller ${origin(CONTROLLER)}`);
  const otherCtl = [...ctl].filter((h) => h !== origin(CONTROLLER));
  if (otherCtl.length) failures.push(`repid-engine: links to ${otherCtl.join(', ')}, which the map does not name`);
  if (!src.some((f) => read(f).includes('/zkp/repid-proof'))) failures.push('repid-engine: no longer posts to /zkp/repid-proof on the prover');
  const pkg = JSON.parse(read(join(dir, 'package.json')));
  if (!depsOf(pkg)[VERIFIER_PKG]) failures.push(`repid-engine: package.json does not depend on ${VERIFIER_PKG}`);
});

half('trustshell', sibling('trustshell'), (dir) => {
  const pkg = JSON.parse(read(join(dir, 'package.json')));
  if (pkg.name !== TRUSTSHELL_PKG) failures.push(`trustshell: package.json name is ${pkg.name}; the map says ${TRUSTSHELL_PKG}`);
  if (!depsOf(pkg)[VERIFIER_PKG]) failures.push(`trustshell: package.json does not depend on ${VERIFIER_PKG}`);
  const src = ['src/lib', 'src/cli', 'src/mcp'].flatMap((d) => sources(join(dir, d)));
  if (src.length === 0) return failures.push('trustshell: no SDK, CLI or MCP source found, so nothing could be compared');
  const hosts = hostsIn(src, RAILWAY);
  if (!hosts.has(origin(ENGINE))) failures.push(`trustshell: its SDK, CLI and MCP server never name the map's engine ${origin(ENGINE)}`);
  const unmapped = [...hosts].filter((h) => h !== origin(ENGINE));
  if (unmapped.length) failures.push(`trustshell: calls ${unmapped.join(', ')}, which the map does not name`);
  const manifest = join(dir, 'extension', 'manifest.json');
  if (!existsSync(manifest)) return failures.push('trustshell: the map says it ships the extension, and extension/manifest.json is gone');
  const perms = JSON.parse(read(manifest)).host_permissions ?? [];
  const reach = perms.map((p) => p.replace(/\/\*$/, ''));
  if (!reach.includes(origin(ENGINE))) failures.push(`trustshell: the extension cannot reach the map's engine (host_permissions: ${perms.join(', ') || 'none'})`);
  const extra = reach.filter((r) => r !== origin(ENGINE));
  if (extra.length) failures.push(`trustshell: the extension reaches ${extra.join(', ')}, which the map does not name`);
});

half('HyperDAG-core', sibling('HyperDAG-core', 'hyperdag-core'), (dir) => {
  const main = join(dir, 'services', 'zkp-postcard', 'src', 'main.rs');
  if (!existsSync(main)) return failures.push('HyperDAG-core: services/zkp-postcard/src/main.rs is gone; the map says the prover lives there');
  if (!read(main).includes('"/zkp/repid-proof"')) failures.push('HyperDAG-core: zkp-postcard no longer serves /zkp/repid-proof, the route the engine posts to');
});

half('trinity-symphony-shared', sibling('trinity-symphony-shared'), (dir) => {
  const src = sources(join(dir, 'lib'));
  if (src.length === 0) return failures.push('trinity-symphony-shared: no lib/ source found, so nothing could be compared');
  if (!src.some((f) => read(f).includes(`'${ENGINE}'`) || read(f).includes(`"${ENGINE}"`))) {
    failures.push(`trinity-symphony-shared: the house agents never name the map's engine ${ENGINE}`);
  }
});

// ---------------------------------------------------------------- verdict ---
if (failures.length) {
  console.log('check:map — FAILED');
  for (const f of failures) console.log(`  ✗ ${f}`);
  for (const n of notChecked) console.log(`  · NOT_CHECKED ${n}`);
  process.exit(1);
}
if (notChecked.length) {
  console.log('check:map — NOT_CHECKED');
  console.log('  This repo\'s half passed: the map heading, the README link and the registry owner.');
  for (const v of verified) console.log(`  ✓ ${v}`);
  for (const n of notChecked) console.log(`  · ${n}`);
  console.log('  An absent checkout says NOTHING about the map. Set HYPERDAG_SIBLINGS_DIR, or clone it beside this repo.');
  process.exit(2);
}
console.log('check:map — VERIFIED');
console.log(`  engine ${ENGINE} · prover ${PROVER} · ${TRUSTSHELL_PKG} · ${VERIFIER_PKG} · controller ${CONTROLLER}`);
console.log(`  matched in: ${verified.join(', ')}; README links #${anchor}; no file says HyperDAG operates the registries`);
