/**
 * Smoke test — runs the local provider on the same 4 cases the repid-engine
 * `runValidation()` demo uses, and prints results. The expectation: identical
 * hal_score and veto decision to the canonical formula, because this package
 * ports extract.ts + score.ts + constants.ts byte-for-byte.
 *
 * Run after `npm run build`:
 *   node tests/smoke.mjs
 */

import { extractHALSignals, computeHALScore, HAL_PYTHAGOREAN_COMMA } from '../dist/index.js';

const cases = [
  {
    name: 'HIGH RISK — overconfident false CRE claim',
    text: 'LA industrial cap rates definitely compressed 4.8% in 2024, proven fact.',
    domain: 'cre-underwriting',
    certainty: 0.95,
  },
  {
    name: 'LOW RISK — appropriately hedged CRE claim',
    text: 'Based on CBRE data, industrial cap rates in LA may have compressed approximately 0.5-1.2% in Q3 2024.',
    domain: 'cre-underwriting',
    certainty: 0.82,
  },
  {
    name: 'HIGH RISK — false technical claim, no hedges',
    text: 'Plonky3 definitely uses BN254 elliptic curve with Groth16, absolutely requires trusted setup.',
    domain: 'technical',
    certainty: 0.92,
  },
  {
    name: 'LOW RISK — verifiable mathematical truth',
    text: 'The Pythagorean Comma ratio is exactly 531441/524288, approximately 1.01364, representing the gap between twelve perfect fifths and seven octaves.',
    domain: 'technical',
    certainty: 0.99,
  },
];

console.log('=== LOCAL HAL SMOKE TEST (no LLM keys, no network) ===\n');
console.log(`HAL_PYTHAGOREAN_COMMA = ${HAL_PYTHAGOREAN_COMMA} (expected ${531441/524288})\n`);

for (const c of cases) {
  const signals = extractHALSignals({ text: c.text, domain: c.domain, certainty: c.certainty });
  const score = computeHALScore(signals);
  console.log(c.name);
  console.log(`  signals: harm=${signals.harm_probability.toFixed(3)} epi=${signals.epistemic_uncertainty.toFixed(3)} ev=${signals.evidence_quality.toFixed(3)} scope=${signals.scope_appropriateness.toFixed(3)}`);
  console.log(`  hal_score=${score.hal_score.toFixed(4)}  vetoed=${score.vetoed}  formula=${score.formula}\n`);
}
