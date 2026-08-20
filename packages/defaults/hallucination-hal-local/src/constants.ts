/**
 * HAL constants — ported verbatim from repid-engine/src/hal/lib/constants.ts.
 *
 * SACRED CONSTANTS — DO NOT MUTATE.
 *
 * Proprietary and load-bearing — this file is the reason the entire package is
 * marked `private: true` in package.json. The HAL_PYTHAGOREAN_COMMA ratio, the
 * formula weights, and the canonical signal field names are all proprietary
 * internals (P-003). Public npm publish requires Sean's explicit approval per
 * CLAUDE.md hard-stop.
 *
 * To preserve byte-equivalence with the production HAL, every constant here
 * is a verbatim copy of the repid-engine source. Future drift between
 * repid-engine and this package would compromise the A/B equivalence guarantee
 * documented in README.md.
 */

export const HAL_PYTHAGOREAN_COMMA: number = 531441 / 524288;

export const HAL_FORMULA_WEIGHTS = {
  harm: 0.4,
  epistemic: 0.3,
  evidence: 0.2,
  scope: 0.1,
} as const;

export const HAL_DEFAULT_VETO_THRESHOLD: number = 0.25;
export const HAL_CONSTITUTIONAL_BLOCK_THRESHOLD: number = 0.48;

export const COMMA_BFT_THRESHOLDS = {
  vetoGap: 0.05,
  vetoAvg: 0.85,
  majorGap: 0.10,
  majorAvg: 0.75,
  minorGap: 0.15,
} as const;

export const COMMA_BAND_TIGHT_THRESHOLD: number = 0.99;
export const COMMA_BAND_LOOSE_THRESHOLD: number = 0.95;

/**
 * Domain ontology vocabularies. High-level definition only — caller can
 * supply additional/custom ontologies via context.
 */
export const DEFAULT_DOMAIN_ONTOLOGIES: Record<string, string[]> = {
  'cre-underwriting': [
    'cap rate', 'noi', 'vacancy', 'absorption', 'ltv', 'dscr', 'irr',
    'cash-on-cash', 'basis points', 'underwriting', 'class a', 'class b',
    'industrial', 'office', 'retail', 'multifamily', 'operating expenses',
    'gross rent', 'debt service', 'net operating income',
  ],
  'compliance': [
    'regulation', 'statute', 'compliance', 'audit', 'disclosure', 'fiduciary',
    'sec', 'finra', 'gdpr', 'ccpa', 'ai act', 'liability', 'mandate',
    'enforcement', 'violation', 'risk management', 'governance',
  ],
  'finance': [
    'revenue', 'ebitda', 'margin', 'yield', 'return', 'risk', 'portfolio',
    'asset', 'liability', 'equity', 'debt', 'interest rate', 'inflation',
    'basis', 'spread', 'valuation', 'cash flow', 'projection',
  ],
  'technical': [
    'algorithm', 'model', 'training', 'inference', 'parameter', 'neural',
    'circuit', 'hash', 'proof', 'contract', 'token', 'consensus',
    'validation', 'cryptography', 'protocol', 'architecture', 'implementation',
  ],
  'legal': [
    'contract', 'clause', 'covenant', 'warranty', 'indemnification', 'lien',
    'title', 'easement', 'encumbrance', 'jurisdiction', 'statute', 'precedent',
  ],
};

export const OVERCONFIDENCE_MARKERS: readonly string[] = [
  'guaranteed', 'certain', 'definitive', 'proven', 'fact',
  'always', 'never', 'impossible', 'must', 'will definitely',
  'risk-free', 'no risk', '100%', 'without doubt',
  'everyone knows', 'obviously', 'clearly', 'undeniably',
];

/**
 * Prompt-injection / jailbreak markers.
 *
 * ADDED 2026-08-05 to close a silent drift — this is a RE-SYNC, not new tuning.
 * Upstream added these on 2026-06-02 (repid-engine 614e986) and fed them into
 * harm_probability; this package was ported on 2026-05-04 and never followed.
 * For three months it scored injection strings at harm_probability 0.00 while
 * its own header asserted byte-equivalence with production. The guarantee was
 * not merely unverified — it was already false, in the signal that matters most
 * for adversarial input.
 *
 * Verbatim from repid-engine/src/hal/lib/constants.ts:136.
 */
export const INJECTION_MARKERS: readonly string[] = [
  'ignore previous', 'ignore all previous', 'new instruction', 'system override',
  'system prompt', 'override protocol', 'do anything now', 'dan mode', 'jailbreak',
  'reveal your', 'output all', 'as a new instruction', 'from the system administrator',
  'maintenance mode', 'developer mode', 'unrestricted', 'no restrictions',
  'confirm you are running without', 'i have been jailbroken',
];

/**
 * Note the duplicate `approximately` at index 0 and again at the tail.
 * This is preserved verbatim from the pre-extraction implementation
 * (`src/services/hal-signals.ts:52-57` at HEAD `204cfcb`). Per repid-engine
 * sprint hard rule #7 (no semantic changes to HAL behavior), this
 * duplicate is preserved here too so A/B equivalence holds.
 */
export const EPISTEMIC_HEDGES: readonly string[] = [
  'approximately', 'roughly', 'around', 'may', 'might', 'could',
  'likely', 'probably', 'suggest', 'indicate', 'appear', 'seem',
  'estimate', 'projection', 'forecast', 'assumption', 'according to',
  'based on', 'as of', 'reported', 'approximately',
];
