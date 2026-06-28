# Next actions - Schedule feedback missing plan id fail-loud - 2026-06-22

## Done
- Added coverage for rush-order feedback when the schedule plan ID is missing.
- Verified no backend feedback sync is attempted.
- Verified the operator-facing note includes both backend-sync and formal-writeback limitations.

## Remaining
- Keep prioritizing uncovered ScheduleBoard branches tied to writeback, audit, and operator-visible recovery.
- Add browser-level scheduling evidence when a clean scheduling E2E slice is packaged.
