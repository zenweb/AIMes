# Next actions - Schedule export CSV toolbar evidence - 2026-06-22

## Done
- Added coverage for toolbar-triggered schedule CSV export.
- Verified export filename, headers, current task row, and progress value.
- Verified `schedule-board.test.ts`.
- Verified the full frontend unit suite.
- Added browser-level export/download evidence in `src/frontend/tests/e2e/scheduling.spec.ts`.
- Verified `工具栏导出 CSV 时真实浏览器下载当前排产计划` downloads a CSV in Chromium and checks filename, headers, task row, and progress value.

## Remaining
- Continue prioritizing ScheduleBoard uncovered branches tied to operator writeback and recovery.
