# 2026-06-15 Schedule Metrics Threshold Coverage

## Change

- Added focused tests for `ScheduleMetrics.vue`.
- Locked the existing scheduling KPI panel behavior:
  - metrics are announced with `role=status` and `aria-live=polite`.
  - utilization and on-time delivery stay green at top thresholds.
  - middle thresholds render warning colors.
  - values below thresholds render critical colors.
  - updated props refresh displayed KPI values.

## Evidence

```powershell
npm run test:unit -- tests/unit/schedule-metrics.test.ts
# 1 file passed, 3 tests passed

npm run test:unit:coverage -- tests/unit/schedule-metrics.test.ts --coverage.include=src/components/schedule/ScheduleMetrics.vue
# ScheduleMetrics.vue statements 100%, branches 100%, functions 100%, lines 100%
```

