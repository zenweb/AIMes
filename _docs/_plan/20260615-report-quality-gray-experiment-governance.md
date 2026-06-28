# 2026-06-15 Plan: Report quality gray experiment governance

## Goal
- Harden the existing report review path for quality gray-release and experiment governance evidence.

## Scope
- Test-only slice in `src/frontend/tests/unit/report-board.test.ts`.
- No production code changes unless the focused test exposes a real behavior gap.

## Steps
1. Read the current report rendering and CSV export branches for quality gray-release and experiment governance records.
2. Make the unit-test mocks controllable for gray monitor, gray decision, experiment comparison, and experiment candidate evidence.
3. Add a focused test covering visible report content and CSV rows.
4. Run the focused test, full `report-board` suite, and focused coverage.

## Success Criteria
- Focused test passes.
- Full `report-board` suite passes.
- Coverage command passes and reports `ReportBoard.vue` line coverage.
