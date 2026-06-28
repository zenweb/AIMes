# 20260621 Labor Retry Plan Helper Split

- Changed the labor retry E2E branch to use `mockLaborRetrySchedulingPlanApis(page)` instead of the real-dhtmlx-oriented `mockSchedulingPlanApis(page)`.
- Added a minimal labor-only scheduling/equipment fixture for `人员证据启动读取失败后可重试`.
- Verified focused E2E: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"` passed 1/1.

