# x402 blast radius
**Run:** `node examples/a2a-purchase/a2a-purchase.mjs` (no wallet env)

```
✓ init: backend healthy (status=ok)
— stopping before discovery/buy (init done). To run the FULL live loop, set:
    • REPID_API_KEY
    • TRUSTSHELL_BUYER_AGENT
    • TRUSTSHELL_PAYER_KEY
```
Exit **0**. No fabricated 402/receipt. HOLD on spend.

Cap: `assertPaymentCap({ amount, cap })` — `tests/x402-cap.test.mjs` PASS (amount 1000n cap 999n → `cap_exceeded`).
