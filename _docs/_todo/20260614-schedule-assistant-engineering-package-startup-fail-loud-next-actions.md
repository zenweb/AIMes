# 2026-06-14 Todo - Schedule Assistant Engineering Package Startup Fail Loud

## Done
- Added a unit regression for Assistant engineering package load failure during ScheduleBoard startup.
- Added real Chromium coverage proving the formal schedule still loads when the Assistant package API and local storage both fail.
- Reused the safe package read after assistant recovery handoff closure.
- Re-ran focused tests, full ScheduleBoard unit tests, full Scheduling Chromium e2e, and frontend coverage.

## Next Actions
- Continue coverage-increment routing on existing user-critical surfaces.
- Candidate next slice: another low-branch-coverage Scheduling or ChatPanel path only if it improves real operator correctness, not cosmetic coverage.
- Keep gray observation out of the active blocking lane unless the owner explicitly re-enables the 14/15-day wall-clock gate.
