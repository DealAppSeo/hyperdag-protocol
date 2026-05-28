/**
 * @hyperdag/hallucination-hal-local — internal local HAL provider.
 *
 * See README.md for the publish-gate constraints. `private: true`.
 */

export { LocalHALProvider } from './providers.js';
export type { LocalHALProviderConfig } from './providers.js';

export { HALRouter } from './router.js';
export type { HALRouterConfig, HDPMode } from './router.js';

// Re-export the remote provider under a clear alias so consumers can name
// what they're getting.
export { HALHallucinationProvider as RemoteHALProvider } from '@hyperdag/hallucination-hal';

// Surface the native types + extractor so power users can drive the local
// extractor directly without the IHallucination wrapper.
export { extractHALSignals } from './extract.js';
export { computeHALScore } from './score.js';
export type {
  NativeHALSignals,
  ExtractInput,
  LocalHALEvaluateOptions,
  CommaSeverity,
  AgreementZone,
  StrictnessLevel,
} from './types.js';

// Surface the constants (read-only) so consumers can verify they're using
// the canonical values.
export {
  HAL_PYTHAGOREAN_COMMA,
  HAL_FORMULA_WEIGHTS,
  HAL_DEFAULT_VETO_THRESHOLD,
} from './constants.js';
