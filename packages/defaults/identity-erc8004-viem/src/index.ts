export { ViemIdentityProvider } from './provider.js';
export type { ViemIdentityProviderConfig } from './provider.js';

export {
  MissingSignerError,
  MainnetGuardError,
  DryRunBlocked,
  AgentNotFoundError,
} from './errors.js';

export {
  BASE_SEPOLIA_CHAIN_ID,
  BASE_MAINNET_CHAIN_ID,
  BASE_SEPOLIA_DEFAULT_RPC,
  BASE_MAINNET_DEFAULT_RPC,
  IDENTITY_REGISTRY_BASE_SEPOLIA,
  REPUTATION_REGISTRY_BASE_SEPOLIA,
  REPUTATION_REGISTRY_BASE_MAINNET,
} from './constants.js';

export { IDENTITY_REGISTRY_ABI } from './abi.js';
