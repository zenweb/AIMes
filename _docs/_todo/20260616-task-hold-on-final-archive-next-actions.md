# 2026-06-16 Task Hold On Final Archive Next Actions

- [ ] Keep task paused while state is `hold_on`.
- [ ] On resume, re-read `.omx/state/task-hold-on.json`.
- [ ] On resume, re-run the latest relevant targeted coverage before code changes.
- [ ] On resume, choose by coverage leverage plus user-critical path value, not by inertia from the previous slice.
- [ ] On resume, do not continue `ProductionBoard.vue`, `ScheduleBoard.vue`, `BomBoard.vue`, `ScannerBoard.vue`, or `AdminBoard.vue` by inertia; require a fresh targeted baseline and a real workflow gap.
- [ ] If changing production behavior, write and verify a failing test first.
- [ ] If documenting already-working behavior, do not change production code unnecessarily.
- [ ] On resume, run full frontend coverage before reporting new progress.
- [ ] Keep backend/staging work on `5003`, not `5000`.
- [ ] Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.
- [ ] Do not revert unrelated dirty worktree changes.
- [ ] Start from the latest completed slice: `ProductionBoard.vue` pagination detail reset, with full frontend coverage `111 files / 1063 tests passed`.
