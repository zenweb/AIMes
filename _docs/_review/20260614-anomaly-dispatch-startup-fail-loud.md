# 2026-06-14 Review - Anomaly Dispatch Startup Fail-Loud

## Review Result
- Scope is limited to:
  - `src/frontend/src/components/anomaly/AnomalyBoard.vue`
  - `src/frontend/tests/unit/anomaly-board.test.ts`
  - `src/frontend/tests/e2e/anomaly.spec.ts`
- The production change is localized to dispatch-record startup recovery.
- The new unit test verifies user-facing behavior: anomaly list remains usable, event-lane buttons remain available, and the failure is surfaced in an alert.
- The new Chromium test verifies the same user path in a real browser.

## Verification
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`: 8 tests passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-board.test.ts`: `AnomalyBoard.vue` line coverage 76.47%.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流记录启动读取失败时真实浏览器仍加载异常列表并 fail-loud"`: Chromium 1 passed.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts`: Chromium 8 passed.
- `npm run test:unit:coverage`: 105 files / 679 tests passed, global lines 82.85%.

## Residual Risk
- `AnomalyBoard.vue` still has lower-coverage dispatch write fallback and dispatch-record construction branches around lines 386-387 and 415-436.
- This slice does not change backend dispatch evidence persistence.
- Gray observation / 15-day monitoring is deferred by owner instruction.
