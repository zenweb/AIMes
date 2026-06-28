# 2026-06-14 Anomaly Startup Failure Aggregate Fail Loud

## Changed
- Hardened the existing Anomaly event center startup path when dispatch-record loading and anomaly-list loading fail together.
- Preserved all startup failure reasons in one fail-loud alert instead of letting the anomaly-list fallback overwrite the dispatch-record failure.
- Kept local demo anomaly records and event dispatch actions available after both startup reads fail.

## Verification
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "both startup dispatch and anomaly list failures"` -> 1 passed.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts --project=chromium -g "启动分流记录和异常列表同时失败"` -> 1 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts` -> 9 passed.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts --project=chromium` -> 9 passed.
- `npm run test:unit:coverage` -> 105 files passed, 690 tests passed, global line coverage 83.17%, `AnomalyBoard.vue` line coverage 77.07%.

## Notes
- This is a boutique hardening slice for the existing Anomaly event center.
- Gray observation remains owner-skipped/deferred and is not used as a blocking criterion for this slice.
