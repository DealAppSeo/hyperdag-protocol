# X402_BLAST_RADIUS — executeA2A / buildX402Payment (P3)
**2026-09-10 (CC, RALPH P3).** Ran `examples/a2a-purchase` against the LIVE engine on published 1.3.0 with **no key/wallet** — honest exit, no faked buy. Mapped the payment signer's blast radius. Cap guard written + tested (PR).

## Honest run (no env — no faked buy)
`node a2a-purchase.mjs` (published 1.3.0, no env) →
```
✓ init: backend healthy (status=ok)
— stopping before discovery/buy (init done). To run the FULL live loop, set:
    • REPID_API_KEY (buyer agent API key from register(); also gates discovery)
    • TRUSTSHELL_BUYER_AGENT (buyer agent UUID the key is bound to)
    • TRUSTSHELL_PAYER_KEY (funded Base Sepolia private key to sign x402)
EXIT=0
```
No 402/receipt was produced because I have no key/funded wallet and **will not invent one** — the script exits 0 printing exactly the missing env. (The buy legs 401 without `REPID_API_KEY`; discovery + contracts are not public.)

## The signer's blast radius — `buildX402Payment(params)`
Measured from published 1.3.0 source. Params: `to` (**payTo**), `amount` (**uint256 raw**), `privateKey` (payer), `chainId`=84532, `asset`=Base Sepolia USDC `0x036CbD…F7e`, `validForSeconds`=3600.
It signs an **EIP-3009 `TransferWithAuthorization`** over `{from,to,value,validAfter:0,validBefore:now+1h,nonce}` and returns a base64 header `{from,to,value,validAfter,validBefore,nonce,signature}`.
- **Blast radius of one signature:** the facilitator can pull **up to `value`** USDC **once** (single-use `nonce`), any time before `validBefore` (~1h). `payTo` = `to`. So the exposure per signed header = exactly `value`, to `to`, within the hour.
- 🔴 **No ceiling in the signer:** `value = BigInt(params.amount)` — it signs **whatever amount is passed**. There is no cap/`maxAmount`/spend-limit anywhere in the published SDK (grepped).

## Cap — written + tested (P3 "write it on a PR")
Cap did not exist on origin. Added **`src/lib/x402-cap.ts`**: `assertWithinCap(amountRaw, capRaw)` / `withinCap(...)` (BigInt, uint256-safe) — **refuse `amount > cap` before signing/escrow**.
- Test `tests/x402-cap.test.ts`: **5/5 pass**, incl. the load-bearing *"a cap below the amount MUST refuse"* (`assertWithinCap(1000,500)` throws `X402CapExceededError`).
- **PR: https://github.com/DealAppSeo/trustshell/pull/123** (no merge/publish). New file — does not touch `trustshell.ts`; a parallel **local, unpushed** WIP branch `feat/assert-payment-cap` adds a cap *method* to the class — reconcile the two when it lands. (I stashed→restored that WIP without committing to it; their lane left as found.)

## Net
The keyless A2A path is safe-by-default (honest exit, no buy without key+wallet). The one sharp edge is the signer having no amount ceiling; the cap guard (PR #123) closes it at the call site. A real 402/receipt (payTo+amount JSON) needs `REPID_API_KEY` + `TRUSTSHELL_BUYER_AGENT` + a funded `TRUSTSHELL_PAYER_KEY` — Sean-only (key + spend). No deploy, no paid buy.
