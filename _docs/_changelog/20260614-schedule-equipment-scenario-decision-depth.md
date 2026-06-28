# 2026-06-14 Schedule Equipment Scenario Decision Depth

## Change
- Strengthened focused unit evidence for the existing `ScheduleBoard` equipment-risk Agent suggestion path.
- Covered recommended scenario name, decision rationale, three scenario options, rejected alternatives, and the adoption feedback trail written for audit/model replay.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
  - 1 file passed.
  - 26 tests passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts`
  - `ScheduleBoard.vue`: lines 75.57%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 673 tests passed.
  - global lines 82.51%.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "风险看板读取失败时真实浏览器展示本地事件 fallback"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; the existing implementation already generated the scenario decision package and adoption trail.
- Coverage percentage did not move because this slice deepened assertions on an already executed path; the value is C6 decision-depth evidence rather than raw line coverage.
- Gray observation / 15-day monitoring remains skipped/deferred by owner direction and is not counted as completed.
