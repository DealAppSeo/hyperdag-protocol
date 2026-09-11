# MARKET_E2E — listServices vs live catalog
**When:** 2026-09-10. SDK: local dist (same API as 1.3.0 `listServices`). Engine: production.

```
count 38
row_keys id,providerAgentId,serviceType,serviceName,description,basePriceUsdcRaw,minRepidToPurchase,active
```

Keyless `listServices({limit:3})` returned **200** with 38 catalog rows (not 401). Cap refuse: `assertPaymentCap({amount, cap})` throws `cap_exceeded` when amount > cap (`tests/x402-cap.test.mjs` 2/2). No marketplace UI.

`examples/a2a-purchase/a2a-purchase.mjs` without env: init ok, then honest stop listing missing `REPID_API_KEY` / `TRUSTSHELL_BUYER_AGENT` / `TRUSTSHELL_PAYER_KEY`. Exit 0. No faked buy.
