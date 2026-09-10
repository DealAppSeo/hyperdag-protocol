# SITE-COPY-PATCH — trustshell.dev (do not deploy)

Draft only. Path B website forbidden to ship from this loop.
Live fetch 2026-09-10: homepage still shows these sentences.

## Sentences to change

| Live sentence | Problem | Smallest honest replacement |
|---|---|---|
| `npm package v1.4.0` (hero, next to `npm install @hyperdag/trustshell`) | 1.4.0 is unpublished. npm latest is **1.3.0**. | `npm package v1.3.0` (or drop the version from the caption) |
| `Claims are cross-checked by a quorum of decorrelated model families` | Implies a full multi-family quorum. Live HAL is **partial, 2/6**. | `Claims are cross-checked by a live HAL quorum (today: 2 of 6 providers; live-degraded).` |
| How-it-works `shell.evaluate(...)` | `evaluate()` is not the published 1.3.0 stranger path. | `shell.verifyOutput('The capital of France is Paris.')` |
| (not on page as those words) **HAL 6/6** | Not a literal string. The quorum sentence is the stand-in. | See row 2. |
| (not on page as those words) **local mesh** | Not a literal string. Closest: decision history / keys on device. ZKP section already says prover is a stub. | Leave privacy section; do not add "portable mesh is live". |
| (not on page as those words) **PAI wizard** | Not a literal string. V1.5 notify ladder is "Coming in V1.5". | Leave as coming; do not label it a shipped wizard. |

## Code pointer (when Sean says deploy)

`components/hero.tsx` imports `package.json` version → prints **v1.4.0** beside npm install. Change the caption to a hard-coded `1.3.0` until publish, or `npm latest` via a live check. Do not change README in this patch.

Do **not** deploy from this loop.
