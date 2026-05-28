/**
 * Custom error classes — keep them named so callers can `instanceof` them
 * and surface clear, actionable messages.
 */

export class MissingSignerError extends Error {
  constructor() {
    super(
      'ViemIdentityProvider: write attempted in read-only mode.\n' +
        'Supply a privateKey or walletClient when constructing the provider:\n' +
        "  new ViemIdentityProvider({ privateKey: '0x…' as `0x${string}` })\n" +
        '  // or\n' +
        '  new ViemIdentityProvider({ walletClient: myWalletClient })'
    );
    this.name = 'MissingSignerError';
  }
}

export class MainnetGuardError extends Error {
  constructor(chainId: number) {
    super(
      `ViemIdentityProvider: write to mainnet chainId=${chainId} blocked.\n` +
        'Pass `{ allowMainnet: true }` to opt in. This guard prevents accidental ' +
        'real-money writes during local development.'
    );
    this.name = 'MainnetGuardError';
  }
}

export class DryRunBlocked extends Error {
  /** The intended call so the test/dev can inspect what would have happened. */
  readonly intended: {
    address: `0x${string}`;
    functionName: string;
    args: readonly unknown[];
  };
  constructor(intended: DryRunBlocked['intended']) {
    super(
      `ViemIdentityProvider: dryRun=true; broadcast suppressed for ${intended.functionName}.`
    );
    this.name = 'DryRunBlocked';
    this.intended = intended;
  }
}

export class AgentNotFoundError extends Error {
  constructor(agentId: bigint) {
    super(`ViemIdentityProvider: agentId ${agentId} not found on registry.`);
    this.name = 'AgentNotFoundError';
  }
}
