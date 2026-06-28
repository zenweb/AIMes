# 2026-06-15 Plan: Schedule risk SLA event evidence

## Goal
- Harden the existing scheduler review path for backend risk SLA closure evidence.

## Scope
- Test-only slice in `src/frontend/tests/unit/schedule-board.test.ts`.
- No production code changes unless the focused test exposes a real behavior gap.

## Steps
1. Generate the current frontend coverage baseline.
2. Select a user-critical, lower-covered component by coverage leverage.
3. Read the scheduler risk event merge and agent suggestion paths.
4. Add a focused risk SLA review event test.
5. Run focused, full-file, and coverage verification.

## Success Criteria
- Focused test passes.
- Full `schedule-board` suite passes.
- Coverage command passes and reports `ScheduleBoard.vue` line/branch coverage.
