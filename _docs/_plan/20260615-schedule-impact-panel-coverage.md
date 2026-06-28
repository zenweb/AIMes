# 2026-06-15 Plan: ScheduleImpactPanel coverage

## Goal

Harden the existing scheduler impact comparison path with focused evidence, without expanding scope or changing production behavior.

## Success Criteria

- `ScheduleImpactPanel` has an independent unit test file.
- Tests assert the baseline vs Agent comparison that schedulers use before adoption.
- Tests cover both positive improvement and neutral no-regression deltas.
- Focused coverage for the component reaches 100%.

## Result

- Added `src/frontend/tests/unit/schedule-impact-panel.test.ts`.
- `npm run test:unit -- tests/unit/schedule-impact-panel.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/schedule-impact-panel.test.ts --coverage.include=src/components/schedule/ScheduleImpactPanel.vue` reported 100% statements, branches, functions, and lines.

## Next Route

Keep following coverage leverage: target the next low-coverage existing user-critical path, while leaving live browser staging until the host `5002` and Docker runtime blockers are cleared.
