# BUS — TrustShell MVP → shippable E2E
Updated 2026-09-15.

## Closed on branches (not published)
E1 unique evidence_id. E2 exclusive floor + window. E3 SQL written not applied. E4 happy-path settle fixtures. E5 score_lane. E6 C9/C10 scratch. S1 A7 filter. S2 #156-158 green. S3 measured quorum or 503. S4 extra cases #756. S5/S11 envelope exported on verify. S6 present_proof on packed tree. S8 README pin 1.3.0. S10 evaluate=verifyOutput alias. S12 local e2e:mvp on pack. #159 refuse eyJ fallback.

## OPEN
F-PUBLISH — Sean: npm publish packed candidate after audit.
F-DDL — Sean: apply unique-on-evidence_id after reading SQL.
F-E2E-PUB — after publish, e2e:mvp against @latest.
F-LIVE-SETTLE — one production service_contracts row reaches settled.
F-STACK-GH — TrustShell stack exists on GitHub as one PR, not only local feat/xc2-2026-09-15-stack.
F-754-CLEAN — rebase #754 if dirty; fold #756; merge when CI green (policy allows if no version bump / no apply-SQL).
F-SITE — site version = published @latest after publish.

## Locks
XC1: repid-engine #754 branch only.
XC2: trustshell stack only. Never #754 scoring files.
