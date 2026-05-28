/**
 * HALRouter — single IHallucination implementation that routes between the
 * local primary and the remote fallback based on HDP_MODE.
 *
 *   mode = 'local'  → only LocalHALProvider
 *   mode = 'remote' → only HALHallucinationProvider (the existing HTTP client)
 *   mode = 'hybrid' (default):
 *       1. Run local.
 *       2. If hal_score lands in [borderline_low, borderline_high]
 *          (default [0.20, 0.30]), AND a remote URL is configured, run
 *          remote and return its result with `{ borderline_routed: true }`
 *          spliced into the signals extras.
 *       3. Otherwise return the local result.
 *
 * Remote unreachable in hybrid mode → return the local result with
 * `{ borderline_fallback: true }` (honest about the fallback).
 *
 * Config precedence: explicit constructor opt > env var > default.
 */

import { LocalHALProvider, type LocalHALProviderConfig } from './providers.js';
import { HALHallucinationProvider } from '@hyperdag/hallucination-hal';
import type {
  HALEvaluationRequest,
  HALResult,
  IHallucination,
  VetoDecision,
} from '@hyperdag/interfaces';

export type HDPMode = 'local' | 'remote' | 'hybrid';

export interface HALRouterConfig {
  mode?: HDPMode;
  borderlineLow?: number;
  borderlineHigh?: number;
  localConfig?: LocalHALProviderConfig;
  // Remote (existing HTTP client) config — same shape as
  // HALHallucinationProviderConfig in @hyperdag/hallucination-hal.
  remoteConfig?: {
    apiUrl?: string;
    apiKey?: string;
    timeoutMs?: number;
    commaThreshold?: number;
  };
}

function resolveMode(opt?: HDPMode): HDPMode {
  if (opt) return opt;
  const env = (globalThis as any).process?.env?.HDP_MODE as string | undefined;
  if (env === 'local' || env === 'remote' || env === 'hybrid') return env;
  return 'hybrid';
}

export class HALRouter implements IHallucination {
  private readonly mode: HDPMode;
  private readonly borderlineLow: number;
  private readonly borderlineHigh: number;
  private readonly local: LocalHALProvider;
  private readonly remote: HALHallucinationProvider;
  private readonly remoteHasUrl: boolean;

  constructor(config: HALRouterConfig = {}) {
    this.mode = resolveMode(config.mode);
    this.borderlineLow = config.borderlineLow ?? 0.20;
    this.borderlineHigh = config.borderlineHigh ?? 0.30;
    this.local = new LocalHALProvider(config.localConfig);
    this.remote = new HALHallucinationProvider(config.remoteConfig ?? {});
    this.remoteHasUrl = Boolean(config.remoteConfig?.apiUrl);
  }

  async evaluate(request: HALEvaluationRequest): Promise<HALResult> {
    if (this.mode === 'remote') {
      return this.remote.evaluate(request);
    }

    // local + hybrid both run local first.
    const localResult = await this.local.evaluate(request);

    if (this.mode === 'local') return localResult;

    // hybrid: borderline check.
    const inBorderline =
      localResult.hal_score >= this.borderlineLow &&
      localResult.hal_score <= this.borderlineHigh;

    if (!inBorderline || !this.remoteHasUrl) {
      return localResult;
    }

    try {
      const remoteResult = await this.remote.evaluate(request);
      return {
        ...remoteResult,
        ...({
          borderline_routed: true,
          local_hal_score: localResult.hal_score,
        } as object),
      };
    } catch {
      // Remote unreachable in hybrid mode — honest fallback to local.
      return {
        ...localResult,
        ...({
          borderline_fallback: true,
          attempted_remote: true,
        } as object),
      };
    }
  }

  async vetoCheck(output: string, consensus: number): Promise<VetoDecision> {
    if (this.mode === 'remote') return this.remote.vetoCheck(output, consensus);
    return this.local.vetoCheck(output, consensus);
  }

  async getCommaThreshold(): Promise<number> {
    // Both providers return the Pythagorean Comma by default; expose
    // whichever the active mode uses. Hybrid returns local's value (the
    // local path is the "primary").
    if (this.mode === 'remote') return this.remote.getCommaThreshold();
    return this.local.getCommaThreshold();
  }

  /** Diagnostic — what mode is this router actually using right now? */
  getMode(): HDPMode {
    return this.mode;
  }
}
