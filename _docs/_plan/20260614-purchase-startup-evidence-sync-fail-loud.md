# 2026-06-14 Plan - Purchase Startup Evidence Sync Fail-Loud

## Objective
- Harden the existing purchase-board startup workflow so multiple evidence sync failures remain visible and do not block the purchase list.

## Success Criteria
- Add a regression test for simultaneous local and backend startup evidence sync failures.
- Keep every startup failure visible instead of overwriting earlier alerts.
- Ensure the purchase board remains usable and the purchase list renders.
- Add real-browser evidence for the same failure mode.
- Run focused and broad verification.

## Execution
- Added one unit regression test in `src/frontend/tests/unit/purchase-board.test.ts`.
- Added local startup evidence recovery in `PurchaseBoard.vue`.
- Added accumulated startup sync failure handling.
- Updated error notification writes to preserve startup sync failure context.
- Added one Chromium scenario in `src/frontend/tests/e2e/purchase.spec.ts`.
- Ran focused unit, focused coverage, focused Chromium, full purchase Chromium, and full frontend unit coverage.

## Stop Condition
- Stop this startup evidence sync subpath for now; it has both unit and real-browser evidence.
- Continue with the next highest-leverage existing feature slice.
- Gray observation / 15-day monitoring remains deferred by owner instruction.
