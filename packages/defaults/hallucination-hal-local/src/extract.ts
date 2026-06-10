/**
 * Path A 5-signal HAL extractor — pure, deterministic, no I/O.
 *
 * Ported verbatim from repid-engine/src/hal/lib/extract.ts (commit
 * 204cfcbe93f85f8cb0ccdc969d2cc4003129c1db). Per the repid-engine sprint
 * hard rules #7 + #8 forbidding behavior tuning, no edits beyond the import
 * paths. The 369-assertion regression test in repid-engine holds the line
 * on byte-equivalence.
 */

import {
  DEFAULT_DOMAIN_ONTOLOGIES,
  EPISTEMIC_HEDGES,
  OVERCONFIDENCE_MARKERS,
} from './constants.js';
import type { ExtractInput, NativeHALSignals } from './types.js';

export function extractHALSignals(input: ExtractInput): NativeHALSignals {
  const { text: claimText, domain, certainty } = input;
  const ontologies = input.domainOntologies
    ? { ...DEFAULT_DOMAIN_ONTOLOGIES, ...input.domainOntologies }
    : DEFAULT_DOMAIN_ONTOLOGIES;

  const text = claimText.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Signal 1: harm_probability
  const overconfidenceCount = OVERCONFIDENCE_MARKERS
    .filter(k => text.includes(k)).length;
  const specificNumbers = (
    text.match(/\d+\.?\d*\s*(%|percent|basis|bps|billion|million)/g) || []
  ).length;
  const harm_probability = Math.min(
    1,
    (overconfidenceCount * 0.18) +
    (specificNumbers * 0.08) +
    (certainty > 0.92 && overconfidenceCount > 0 ? 0.2 : 0),
  );

  // Signal 2: epistemic_uncertainty
  const hedgeCount = EPISTEMIC_HEDGES
    .filter(k => text.includes(k)).length;
  const hedgeDensity = hedgeCount / Math.max(wordCount / 8, 1);
  let certaintyHedgeMismatch =
    certainty > 0.88 && hedgeCount === 0 ? 0.35 : 0;

  if (domain === 'mathematics' || domain === 'cryptography') {
    certaintyHedgeMismatch *= 0.30;
  }

  let epistemic_uncertainty = Math.min(
    1,
    Math.max(0, 0.45 - (hedgeDensity * 0.25) + certaintyHedgeMismatch),
  );

  if (domain === 'mathematics' || domain === 'cryptography') {
    epistemic_uncertainty *= 0.15;
  }

  // Signal 3: evidence_quality
  const hasNumbers = /\d+/.test(text);
  const hasTemporalRef = /\b(20\d\d|q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(text);
  const hasProperNouns = /\b[A-Z][a-z]{2,}(\s[A-Z][a-z]{2,})+/.test(claimText);
  const lengthScore = Math.min(1, wordCount / 40);
  const evidence_quality = Math.min(
    1,
    (hasNumbers ? 0.25 : 0) +
    (hasTemporalRef ? 0.20 : 0) +
    (hasProperNouns ? 0.15 : 0) +
    (lengthScore * 0.40),
  );

  // Signal 4: scope_appropriateness — Jaccard-like overlap with domain ontology.
  const ontology = ontologies[domain] ?? ontologies['finance'] ?? [];
  const matchCount = ontology
    .filter(term => text.includes(term.toLowerCase())).length;
  const scope_appropriateness = Math.min(
    1,
    matchCount / Math.max(ontology.length * 0.25, 1),
  );

  return {
    harm_probability,
    epistemic_uncertainty,
    evidence_quality,
    scope_appropriateness,
    certainty_at_claim: certainty,
  };
}
