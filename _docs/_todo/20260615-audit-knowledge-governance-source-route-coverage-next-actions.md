# 2026-06-15 Audit knowledge governance source route coverage next actions

- [x] Select `AuditDecisionReplayPanel.vue` as the next low-coverage, user-critical audit component.
- [x] Add RED coverage for knowledge governance review replay source-document traceability.
- [x] Confirm RED failure is caused by missing `.trace-link`, not test setup.
- [x] Add the minimal `/knowledge` route and `文档治理` route label to knowledge governance replay mapping.
- [x] Verify target audit replay suite passes.
- [x] Verify full frontend coverage passes.
- [ ] Continue coverage-leverage work on the next lowest user-critical component.
- [ ] Re-run PostgreSQL/staging on the non-5000 API port after Docker engine health is confirmed in this execution environment.
