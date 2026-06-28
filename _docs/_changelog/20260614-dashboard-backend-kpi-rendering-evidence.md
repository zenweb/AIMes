# 2026-06-14 Dashboard Backend KPI Rendering Evidence

## Change
- Added focused unit evidence for `DashboardBoard.vue` positive backend dashboard rendering.
- Covered a successful `getDashboard()` payload flowing into KPI cards, equipment counts and list, today schedule, material alerts, and quality overview.
- Asserted the positive path does not show the dashboard data fail-loud alert or empty fallback states.

## Evidence
- `npm run test:unit -- tests/unit/dashboard-board.test.ts`
  - 1 file passed.
  - 6 tests passed.
- `npm run test:unit:coverage -- tests/unit/dashboard-board.test.ts`
  - `DashboardBoard.vue`: lines 87.73%.
- `npm run test:e2e -- tests/e2e/dashboard.spec.ts -g "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标"`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 676 tests passed.
  - global lines 82.77%.

## Notes
- No production code change was required; the existing implementation already rendered the backend dashboard payload correctly.
- This slice strengthens regression evidence for the production overview cockpit instead of broadening feature scope.
- Gray observation / 15-day monitoring remains skipped/deferred by owner direction and is not counted as a current blocker.
