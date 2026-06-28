# 2026-06-16 Risk Monitoring Close Fail Loud Next Actions

- [x] Add a red test for realtime monitoring situation closure writeback failure after risk trace archival.
- [x] Catch `closeMonitoringSituationEscalation` failures with a visible alert.
- [x] Keep the realtime monitoring situation package escalated when the second-phase close write fails.
- [x] Run the targeted RiskActionQueuePanel regression test.
- [x] Run targeted RiskActionQueuePanel coverage.
- [x] Run full frontend coverage.
- [x] Seal this slice in changelog, review, plan, todo, and issue documents.
- [ ] Hold further autonomous slicing until GPT 5.6 or the owner resumes the task.
- [ ] On resume, choose the next slice by coverage leverage plus user-critical value, not by inertia from the previous component.
- [ ] Keep backend/staging work on `5003`, not `5000`.
- [ ] Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.
