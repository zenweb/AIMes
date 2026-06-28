# 2026-06-15 Audit Replay Config Approval Local Fallback On Error Next Actions

- [x] Add a direct regression test for configuration approval backend-error local fallback.
- [x] Verify local approval badge and approval row remain visible.
- [x] Verify approval replay details remain openable.
- [x] Verify assertive alert text identifies the backend approval failure.
- [x] Verify targeted and related replay tests pass.
- [x] Verify full frontend coverage passes.
- [ ] On resume, inspect remaining uncovered `AuditDecisionReplayPanel.vue` branches around backend business-write and schedule feedback failure handling.
- [ ] Keep backend/staging work on port `5003` if it is needed later.
