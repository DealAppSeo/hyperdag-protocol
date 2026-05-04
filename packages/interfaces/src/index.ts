/**
 * @hyperdag/interfaces — Six TypeScript interface contracts that define the
 * HyperDAG Protocol modular trust kernel.
 *
 * Pair with `@hyperdag/defaults` for curated reference implementations, or
 * implement these interfaces against your own backing infrastructure.
 *
 * @see ARCHITECTURE.md at the repo root for the high-level design.
 */

export type { IIdentity } from "./IIdentity.js";
export type { IReputation } from "./IReputation.js";
export type { IValidation } from "./IValidation.js";
export type { IPayment } from "./IPayment.js";
export type { ILinkage } from "./ILinkage.js";
export type { IHallucination } from "./IHallucination.js";

export * from "./types/index.js";
