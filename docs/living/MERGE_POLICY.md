# MERGE_POLICY

Ratified 2026-09-15 by Sean. Agents read this before opening or holding a PR.

## Agent MAY squash-merge a draft when all of these are true

- Checks green
- No secrets, no prod ids, no `.env`
- No `package.json` version bump
- No "apply this SQL to prod"
- Not `npm publish`

Draft is a review flag, not a hold. After merge, take the next BUS id.
Empty mailbox is not idle.

## Agent MUST NOT

- `npm publish`
- `supabase db push` / apply prod DDL
- Railway env or restart
- Say "MVP launched"
- Open a new PR when a stack branch already exists for that lane

## Still Sean-only

- Publish `@hyperdag/trustshell` / MCP
- Apply `migrations/2026-09-15_kind_custody.sql`
- Railway / prod secrets
- Public launch language

## Stacking

- Engine lane: `feat/xc-2026-09-15-x8-adversarial-harness` (PR #754). Fold extra tests into it.
- TrustShell lane: one stack PR. Do not mint #162+ for the next letter.
