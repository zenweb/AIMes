# 2026-06-15 Audit Replay POC and OTD Rework Release Coverage Plan

## Objective

Finish the current audit replay hardening slice by pinning the remaining POC, OTD, and barcode rework release paths with direct regression tests.

## Scope

- Add only targeted tests.
- Keep production behavior unchanged unless a verified defect requires a minimal fix.
- Re-run targeted, related, and full frontend verification after the slice.
- Keep the work inside `AuditDecisionReplayPanel.vue` and its unit test file.

## Verification Path

1. Add one regression test per remaining important branch.
2. Run targeted replay unit tests.
3. Run targeted coverage for the replay panel.
4. Run related regression files.
5. Run full frontend coverage.

## Stop Condition

Stop after the new coverage is verified and the remaining work is either genuinely low-value or only redundant outer catch paths.
