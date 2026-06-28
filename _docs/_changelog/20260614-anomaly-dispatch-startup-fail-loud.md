# 2026-06-14 Anomaly Dispatch Startup Fail-Loud

## Change
- Hardened `AnomalyBoard.vue` startup behavior when stored anomaly dispatch records cannot be read.
- `applyStoredDispatchRecords()` now catches read failures, clears stale dispatch state, shows a fail-loud alert, and continues loading the anomaly list.
- Added focused unit evidence proving anomaly records still render and all event lanes remain available for new routing confirmation.
- Added Chromium evidence for the same startup failure path with backend dispatch read failure plus localStorage read/cleanup failure.

## Evidence
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`
  - 1 file passed.
  - 8 tests passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-board.test.ts`
  - `AnomalyBoard.vue`: lines 76.47%.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流记录启动读取失败时真实浏览器仍加载异常列表并 fail-loud"`
  - Chromium: 1 test passed.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts`
  - Chromium: 8 tests passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 679 tests passed.
  - global lines 82.85%.

## Notes
- This slice moved `AnomalyBoard.vue` focused line coverage from 75.83% to 76.47%.
- The fix is reliability hardening for an existing user-critical anomaly workflow; no new product scope was added.
- Gray observation / 15-day monitoring is skipped/deferred by owner direction and is not counted as a current blocker.
