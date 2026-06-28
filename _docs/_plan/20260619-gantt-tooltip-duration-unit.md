# Plan: Gantt tooltip duration unit

Date: 2026-06-19
Status: Completed

## Success criteria

- A work-order tooltip for an explicit 12-hour schedule window must display `12 小时`.
- The regression test must fail before the production fix and pass after it.
- Existing Gantt drag, lock-period, scale, initialization, and cleanup tests must remain green.
- Frontend coverage and lint must remain green.

## Implementation

- Added a focused unit test in `tests/unit/gantt-chart.test.ts`.
- Updated the work-order tooltip template in `src/components/gantt/GanttChart.vue` from `天` to `小时`.
- Left unrelated Gantt behavior and existing dirty worktree changes untouched.

## Verification

- Targeted RED confirmed the old tooltip output contained `12 天`.
- Targeted GREEN passed after the fix.
- `npx vitest run tests/unit/gantt-chart.test.ts --coverage.enabled=false`: 28 passed.
- Regression refresh: `npm run test:unit:coverage`: 111 files / 1082 tests passed.
- `npm run lint`: passed.
