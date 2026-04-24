# x402 Integration Design: Stake-Your-Rep Settlement

## 1. Coinbase x402 Reference Audit
- **SDK Languages:** TypeScript (primary reference SDK).
- **Core Spec:** The HTTP 402 response includes a `WWW-Authenticate: x402` header specifying the payment endpoint, required price, currency, and a unique challenge/invoice. The client proves payment in the retry by supplying an `Authorization: x402 <payment_receipt>:<signature>` header.
- **Reference Middleware:** Implements standard Express/Next.js middleware patterns that intercept requests, validate x402 headers, and verify settlement via Coinbase CDP or Smart Wallets.
- **Payment Settlement:** Supports USDC natively on Base, leveraging the Coinbase Developer Platform (CDP).
- **License:** Apache License 2.0 (highly permissive, fully compatible with our vendor/fork strategy).

## 2. Integration Points
### a. Stake-Your-Rep Escrow
- **Service:** `repid-engine`
- **Endpoint:** `POST /stake`
- **Currency:** USDC on Base
- **Failure Behavior:** If the request lacks an x402 header, returns HTTP 402 with the required invoice. The stake is completely ignored until the client retries with a valid, settled payment receipt.

### b. Stake-Your-Rep Slash Settlement
- **Service:** `repid-engine` (background resolution worker)
- **Currency:** USDC on Base
- **Failure Behavior:** Slashing pushes funds via x402 outbound transfers (Challenger + burn + treasury). Failed outbound transfers are queued for exponential backoff and retry.

### c. Custodian Registration Fee
- **Service:** `trustrepid-backend`
- **Endpoint:** `POST /custodian/register`
- **Currency:** USDC on Base
- **Failure Behavior:** Returns 402 Payment Required. The human SBT (Soulbound Token) claim fails/reverts until the Sybil-resistance fee is paid.

### d. Agent Tool-Call Micropayments
- **Service:** `trinity-litellm`
- **Endpoint:** External API endpoints
- **Currency:** USDC on Base
- **Failure Behavior:** When an external API returns 402, the agent intercepts the challenge, fulfills the x402 payment using its embedded CDP wallet, and autonomously retries the tool call with the newly acquired receipt.

### e. A2A Agent-to-Agent Calls
- **Service:** Any inter-agent endpoint gated by x402 middleware
- **Currency:** Price negotiable across `supported_tokens` config (USDC today, more later)
- **Failure Behavior:** Endpoint returns 402 with `WWW-Authenticate` listing accepted tokens. RepID (Reputation Identity Credential) is included in envelope for tier-based pricing and gating.
- **Example:** SOPHIA calls GUARDIAN for compliance check → GUARDIAN's `supported_tokens` has USDC → GUARDIAN quotes 2.0 USDC, reads SOPHIA's AUTONOMOUS RepID, applies placeholder 30% discount → final price 1.4 USDC → SOPHIA pays from CDP wallet → call proceeds.

## 3. Scaffold Middleware (`repid-engine`)
```typescript
// x402Middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyX402Payment } from '@x402/sdk';
import { getSupportedTokens, getEndpointPrice } from './config/tokens';

export async function x402Middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const senderRepId = req.headers['x-sender-repid']; // Extract from signed envelope
  
  // Read supported_tokens from config (cached with TTL)
  const tokens = await getSupportedTokens();
  const basePriceUsd = await getEndpointPrice(req.path); // TODO: per-endpoint price config lookup
  
  // Apply RepID-tier discount logic before quoting
  let discountMultiplier = 1.0;
  if (senderRepId && Number(senderRepId) >= 7500) {
     discountMultiplier = 0.8; // PLACEHOLDER: 20% off for high RepID
  }
  const finalPrice = basePriceUsd * discountMultiplier;

  // Missing or malformed payment
  if (!authHeader || !authHeader.startsWith('x402 ')) {
    // Generate WWW-Authenticate challenge with all enabled tokens
    const tokenChallenges = tokens.filter(t => t.enabled).map(t => ({
      amount: (finalPrice / t.price_feed_rate).toFixed(t.decimals),
      currency: t.symbol,
      network: t.chain,
      destination_address: process.env.ESCROW_WALLET_ADDRESS,
      nonce: generateNonce()
    }));

    return res.status(402).json({
      error: 'Payment Required',
      x402_challenge: tokenChallenges
    });
  }

  const receipt = authHeader.split(' ')[1];
  try {
    // Verify settlement on-chain / CDP for ANY enabled token from the accepted set
    const paymentRecord = await verifyX402Payment(receipt, process.env.ESCROW_WALLET_ADDRESS, tokens);
    if (!paymentRecord) throw new Error('Invalid or unsettled payment');
    
    // Log payment receipt asynchronously
    await logX402Payment(req, paymentRecord, senderRepId, discountMultiplier);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'x402 Verification Failed' });
  }
}

async function logX402Payment(req: Request, record: any, senderRepId: string, discount: number) {
    // Insert into x402_payment_log
}
```

## 4. Schema Draft
### `x402_payment_log`
- `id` (bigint, pk)
- `request_path` (text)
- `payment_currency` (text)
- `payment_amount` (numeric)
- `payer_address` (text)
- `receipt_tx_hash` (text)
- `use_case_tag` (enum: `stake_escrow`, `slash_settlement`, `custodian_fee`, `tool_micropayment`)
- `request_id` (text)
- `status` (text)
- `created_at` (timestamptz)
- `payment_token` (text, references `supported_tokens.symbol`)
- `payment_chain` (text)
- `sender_repid` (numeric, captured at call time for A2A, nullable for non-A2A)
- `sender_repid_tier` (text, captured at call time, nullable)
- `rep_tier_discount_applied` (numeric, nullable)
- `token_config_version` (text, for audit trail on which token config was active at call time)

### `supported_tokens`
- `symbol` (text, pk)
- `chain` (text, pk)
- `contract_address` (text, nullable for native tokens)
- `decimals` (int)
- `cdp_wallet_addressable` (boolean)
- `price_feed_reference` (text, nullable — e.g. ChainLink or Pyth feed ID)
- `enabled` (boolean — allows soft-disable without removing)
- `rep_tier_discount_allowed` (boolean — whether tier-based discounts apply to this token)
- `config_version` (timestamptz)

## 5. Stake-Your-Rep End-to-End Composition Flow

**CORRECTION NOTE (2026-04-24):** A prior draft of this section described RepID slash amounts transferring between users. This was incorrect. Per Sean's economic model, RepID is non-transferable, non-fungible, and never converts to any other token. Only USDC moves in slashing events. RepID scores adjust via parallel recomputation (`repid_score_events`). The two ledgers never cross.

1. Human custodian stakes USDC collateral on agent's claim X. Required USDC = `base_amount × collateral_coefficient(current_RepID)`. Higher RepID → lower coefficient → less USDC required.
2. `POST /stake` lacks x402 auth. Returns HTTP 402 with USDC invoice for full required collateral on Base.
3. Human settles USDC via Coinbase Smart Wallet. Retries `/stake` with `Authorization: x402 <receipt>`.
4. Middleware verifies USDC settlement via CDP. Stake record inserted into `agent_stake` table, `resolution_policy='hal_veto_24h'`. USDC held in escrow wallet.
5. HAL (Hallucination Assessment Layer) vetoes claim X within 24h. Background resolution worker fires.
6. Slash Event (USDC only — RepID NEVER transfers):
   - USDC collateral slashed: 70% outbound x402 transfer to Challenger, 20% burned, 10% to Wall of Shame treasury (these ratios are PLACEHOLDER pending Sean approval).
   - Outbound USDC transfers fail-safe — queue with exponential backoff on failure.
   - SEPARATELY, per score recomputation policy: User A's RepID decreases (decay factor × stake weight) via `event_type='STAKE_LOSS'` in `repid_score_events`; Challenger's RepID increases (reward factor) via `event_type='CHALLENGE_WIN'`. Parallel ledger events, NOT transfers.
7. USDC receipts persist in `x402_payment_log`. RepID adjustments persist in `repid_score_events`. Cross-reference via `stake_id`.

## 6. A2A Multi-Token Exchange, Extensible Architecture

### 6.1 Multi-Token Design Principle
x402 integration is architected for N tokens, not a fixed set. Configuration-driven. Adding tokens later is a config entry, not a code change.

### 6.2 Tokens Named Today
- **USDC on Base:** Primary settlement currency, verified in Coinbase x402 reference. Chain: `base-mainnet`. Decimals: 6. CDP-wallet-addressable: yes.

### 6.3 Tokens TBD
Sean has flagged "at least 3 tokens" for A2A exchange but has not specified the other two or three. Design treats them as "slots in a config array" to be populated when Sean decides. Placeholders are labeled `<token_2_tbd>` and `<token_3_tbd>`.

### 6.4 Token Config Schema
The `supported_tokens` array of objects (see Section 4 for table representation) maintains all token metadata allowing the middleware to adapt seamlessly.

### 6.5 RepID in A2A Envelope (Read-Only)
When Agent A calls Agent B via an x402-wrapped endpoint, the payment envelope includes:
- Sender ERC-8004 (agent identity standard) token ID
- Sender's current RepID (read from `agent_repid` at call time, signed by sender's CDP wallet)
- HyperDAG Trust Protocol v1 version
- Payment receipt in whichever token Agent B accepted

RepID is informational only. Never transferred. Used by Agent B to apply tier-based pricing or gating.

### 6.6 Token Negotiation Flow
a. Agent A calls Agent B's endpoint with no payment header
b. Agent B responds 402 with `WWW-Authenticate` listing accepted tokens from its `supported_tokens` config:
   `WWW-Authenticate: x402 tokens="USDC,<token_2_tbd>" usdc_price="0.10" <token_2_tbd>_price="<tbd>" destination="0x..."`
c. Agent A checks its CDP wallet for available balance in accepted tokens
d. Agent A pays in preferred token (cheapest, or per custodian policy)
e. Agent A retries call with payment receipt
f. Agent B verifies settlement, reads Agent A's RepID tier from envelope, applies any tier-based discounts or gating

### 6.7 RepID-Tier-Based Discount and Gating
Agent B MAY offer (PLACEHOLDER values, Sean to approve):
- **Discount:** for high-RepID callers (example: RepID >= 7500 gets 20% off)
- **Hard Gating:** reject calls from RepID < threshold
- **Credit Line:** for very high RepID (e.g., RepID > 9000: allow call on promise-to-settle, auto-slash custodian USDC if not settled in 24h)

### 6.8 CDP Wallet Prerequisite
For A2A flows to work, each agent needs a CDP wallet provisioned with balance in whichever tokens it may need to pay with. This is a HARD PREREQUISITE. Without per-agent CDP wallets, A2A x402 doesn't work. *Flag as separate design sprint: "CDP wallet provisioning + funding strategy per agent."*
