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
- **Failure Behavior:** Returns 402 Payment Required. The human SBT claim fails/reverts until the Sybil-resistance fee is paid.

### d. Agent Tool-Call Micropayments
- **Service:** `trinity-litellm`
- **Endpoint:** External API endpoints
- **Currency:** USDC on Base
- **Failure Behavior:** When an external API returns 402, the agent intercepts the challenge, fulfills the x402 payment using its embedded CDP wallet, and autonomously retries the tool call with the newly acquired receipt.

## 3. Scaffold Middleware (`repid-engine`)
```typescript
// x402Middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyX402Payment } from '@x402/sdk';

export async function x402Middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  // Missing or malformed payment
  if (!authHeader || !authHeader.startsWith('x402 ')) {
    return res.status(402).json({
      error: 'Payment Required',
      x402_challenge: {
        amount: "10.00",
        currency: "USDC",
        network: "base",
        destination_address: process.env.ESCROW_WALLET_ADDRESS,
        nonce: generateNonce()
      }
    });
  }

  const receipt = authHeader.split(' ')[1];
  try {
    // Verify settlement on-chain / CDP
    const isValid = await verifyX402Payment(receipt, process.env.ESCROW_WALLET_ADDRESS);
    if (!isValid) throw new Error('Invalid or unsettled payment');
    
    // Log payment receipt asynchronously
    await logX402Payment(req, receipt);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'x402 Verification Failed' });
  }
}

async function logX402Payment(req: Request, receipt: string) {
    // Insert into x402_payment_log
}
```

## 4. Schema Draft (`x402_payment_log`)
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

## 5. Stake-Your-Rep End-to-End Composition Flow
1. User A makes claim X, and escrows 100 RepID via `POST /stake`. The initial request lacks x402 auth.
2. The endpoint halts and returns **HTTP 402 Payment Required** with a Base USDC invoice details payload.
3. User A settles the payment via a Coinbase Smart Wallet, then retries `POST /stake` with `Authorization: x402 <receipt>`.
4. Middleware verifies the payment settlement. The stake is accepted, and `resolution_policy='hal_veto_24h'` is locked into the database.
5. HAL vetoes the claim within 24 hours. The resolution background job fires.
6. **Slash Event:** 70 RepID value equivalent transferred to Challenger (User B), 20 RepID burned, 10 RepID routed to the Wall of Shame treasury (all executing outbound x402 transfers automatically).
7. All inbound and outbound payment receipts are persisted securely in `x402_payment_log`.
