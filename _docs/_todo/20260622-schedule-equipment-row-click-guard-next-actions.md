# Next actions - Schedule equipment row click guard - 2026-06-22

## Done
- Added coverage for equipment group row clicks in the schedule Gantt.
- Verified no backend work-order detail request is made.
- Verified the detail panel remains hidden and error-free.
- Added browser-level Gantt row interaction evidence in `src/frontend/tests/e2e/scheduling.spec.ts`.
- Verified the real browser clicks the equipment group row `eq-agent-e2e-001`, makes zero `/api/v1/scheduling/workorders/**` requests, and keeps the work-order detail dialog closed.

## Remaining
- Continue covering ScheduleBoard user actions and fail-loud branches before lower-value mapping branches.
