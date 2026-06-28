# 2026-06-22 Schedule Drag Writeback Fail-Loud

- Hardened `ScheduleBoard` drag writeback so missing task ids and missing schedule plan ids show visible save failures instead of returning silently.
- Kept successful drag writeback status visible with the saved time window and formal schedule writeback state.
- Added focused unit coverage for missing plan id and missing writable task.

Verification:
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 1 file / 76 tests.
- `git diff --cached --check`: PASS.
