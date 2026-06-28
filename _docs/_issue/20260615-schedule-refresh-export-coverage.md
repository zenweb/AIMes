# 2026-06-15 Issue: Schedule toolbar refresh/export paths were undercovered

Problem:
- ScheduleBoard had strong coverage around optimization, drag writeback, feedback, and several failure paths, but the toolbar refresh and CSV export paths were not directly asserted.
- Without those tests, regressions in stale warning cleanup or exported row construction could pass unnoticed.

Resolution:
- Added a refresh recovery test that starts in backend fallback mode, triggers toolbar refresh, and verifies the authoritative schedule is restored with stale warnings cleared.
- Added a CSV export test that verifies `排产计划.csv`, the expected headers, and the current schedule row payload.

Status:
- Resolved for this slice.
- Broader ScheduleBoard scenario branches remain candidates for future coverage-leverage passes.
