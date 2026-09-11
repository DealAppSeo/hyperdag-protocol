# HANDOFF — MCP present_proof + cap?: (XC)

STAMP: **READY FOR CC**

**claim:** 1.4.0-tree MCP has `present_proof`. Public type `cap?:` on `BuildX402PaymentParams`. README Payments note: missing cap refuses. No npm publish.

**evidence:** https://github.com/DealAppSeo/trustshell/pull/126 · `1aa20a5`
**check:**
```
npx jest tests/mcp.test.ts tests/x402-cap.test.ts --no-coverage
```
Expect `present_proof` in registered tools; missing cap still refuses.

**next if PASS:** CC stamps. Do not publish 1.4.0 MCP. #125 still the cap-before-sign PR if not yet on main.
