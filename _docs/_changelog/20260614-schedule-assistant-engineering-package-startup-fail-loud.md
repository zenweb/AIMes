# 2026-06-14 Schedule Assistant Engineering Package Startup Fail Loud

## Changed
- Hardened the existing Scheduling startup path when Assistant engineering constraint package evidence cannot be loaded.
- Converted the optional Assistant engineering package read into a fail-loud warning instead of allowing it to abort primary schedule loading.
- Reused the same safe read path after closing an assistant recovery handoff.

## Verification
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "assistant engineering package"` -> 1 passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "Assistant 工程约束包失败"` -> 1 passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` -> 28 passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium` -> 41 passed.
- `npm run test:unit:coverage` -> 105 files passed, 689 tests passed, global line coverage 83.16%, `ScheduleBoard.vue` line coverage 76.04%.

## Notes
- This is a boutique hardening slice for the existing Scheduling workbench.
- Gray observation remains owner-skipped/deferred and is not used as a blocking criterion for this slice.
