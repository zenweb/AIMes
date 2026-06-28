# 2026-06-15 Plan: Report POC rollout and pilot evidence

## Goal
- Harden the existing POC report review path by proving backend-first rollout and pilot-run evidence remains visible and exportable.

## Scope
- Test-only slice in `src/frontend/tests/unit/report-board.test.ts`.
- No production code changes unless the focused test exposes a real behavior gap.

## Steps
1. Read the current `ReportBoard` POC rollout/pilot rendering and CSV export behavior.
2. Add a focused unit test for backend-first rollout and pilot records.
3. Verify the focused test.
4. Verify the full `report-board` unit suite.
5. Verify focused coverage for `ReportBoard.vue`.

## Success Criteria
- Focused test passes.
- Full `report-board` suite passes.
- Coverage command passes and reports `ReportBoard.vue` line coverage.
