# 2026-06-18 Task Hold On Final Archive Next Actions

- [x] Refresh `.omx/state/task-hold-on.json`.
- [x] Preserve 2026-06-18 eval malformed golden evidence.
- [x] Preserve 2026-06-18 `AnomalyRepository` no-tracking evidence.
- [x] Record latest integration and architecture regression results.
- [ ] Keep task paused while state is `hold_on`.
- [ ] On resume, re-read `.omx/state/task-hold-on.json`.
- [ ] On resume, run a fresh baseline before code changes.
- [ ] Choose the next slice by coverage leverage plus existing user-critical path value.
- [ ] Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.
- [ ] Do not use backend port `5000`; prefer `5003`.
