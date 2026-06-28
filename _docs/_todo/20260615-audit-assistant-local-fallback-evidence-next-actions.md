# 2026-06-15 Audit assistant local fallback evidence next actions

- [x] Select `AuditDecisionReplayPanel.vue` as the current low-coverage, user-critical audit component.
- [x] Add RED coverage for invalid backend assistant-audit payload with local fallback evidence available.
- [x] Confirm RED failure shows local assistant evidence is not selected.
- [x] Preserve local assistant action replay evidence while keeping fail-loud sync alerts.
- [x] Verify target audit replay suite passes.
- [x] Verify full frontend coverage passes.
- [ ] Continue coverage-leverage work on the next lowest user-critical component or remaining audit replay branch.
- [ ] Re-run PostgreSQL/staging only after Docker engine health is confirmed from this execution environment.
