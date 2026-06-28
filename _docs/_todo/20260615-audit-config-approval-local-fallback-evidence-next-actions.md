# 2026-06-15 Audit config approval local fallback evidence next actions

- [x] Select `AuditDecisionReplayPanel.vue` as the current lowest user-critical component by coverage.
- [x] Add RED coverage for invalid backend configuration approval payload with local approval evidence available.
- [x] Confirm RED failure shows local approval evidence is not retained.
- [x] Preserve local configuration approval evidence while keeping fail-loud sync alerts.
- [x] Verify target audit replay suite passes.
- [x] Verify full frontend coverage passes.
- [ ] Continue coverage-leverage work on the next lowest user-critical component or remaining audit replay branch.
- [ ] Re-run PostgreSQL/staging only after Docker engine health is confirmed from this execution environment.
