# 2026-06-15 Plan: Purchase startup evidence restore

## Goal
- Harden the existing procurement board startup restore path for already-audited procurement evidence.

## Scope
- Test-only slice in `src/frontend/tests/unit/purchase-board.test.ts`.
- No production code changes unless the focused test exposes a real behavior gap.

## Steps
1. Read current procurement evidence startup logic and existing tests.
2. Add restored supply risk and supplier network fixtures.
3. Add a focused startup restore test covering supply risk, supplier network, and outsourcing evidence.
4. Run focused, full-file, and coverage verification.

## Success Criteria
- Focused test passes.
- Full `purchase-board` suite passes.
- Coverage command passes and reports `PurchaseBoard.vue` line coverage.
