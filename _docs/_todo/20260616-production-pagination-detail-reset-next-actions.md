# 2026-06-16 Production Pagination Detail Reset Next Actions

- [ ] Keep the CC remediation goal active.
- [ ] Re-run a fresh frontend coverage baseline before selecting the next slice.
- [ ] Choose the next slice by coverage leverage plus user-critical path value.
- [ ] Do not keep polishing `ProductionBoard.vue` unless a fresh real workflow gap is found.
- [ ] Do not keep polishing `ScheduleBoard.vue`, `BomBoard.vue`, `ScannerBoard.vue`, or `AdminBoard.vue` by inertia.
- [ ] For any production behavior change, write and verify the failing test first.
- [ ] Keep Vitest coverage commands serial because `coverage/.tmp` is shared.
- [ ] Keep backend/staging work on `5003`, not `5000`.
- [ ] Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.
- [ ] Preserve unrelated dirty worktree changes.
