# Next actions - Schedule labor evidence retry recovery - 2026-06-22

## Done
- Added focused coverage for startup labor evidence retry recovery.
- Verified warning visibility, retry execution, and warning cleanup.
- Verified `schedule-board.test.ts`.
- Verified the full frontend unit suite.
- Added browser-level evidence in `src/frontend/tests/e2e/scheduling.spec.ts`.
- Verified `人员证据启动读取失败后可重试并释放排产人员约束` retries startup labor evidence reads and clears the warning in Chromium.

## Remaining
- Continue targeting ScheduleBoard writeback, audit, and recovery branches with low coverage.
