# 2026-06-15 Audit Replay Quality Feedback Load Fail Loud Next Actions

- [x] Add a direct regression test for quality feedback input load failure.
- [x] Verify base replay cards remain visible.
- [x] Verify assertive alert text identifies both failed inputs.
- [x] Verify targeted and related replay tests pass.
- [x] Verify full frontend coverage passes.
- [ ] On resume, inspect remaining uncovered `AuditDecisionReplayPanel.vue` branches around backend business-write and schedule feedback failure handling.
- [ ] Keep backend/staging work on port `5003` if it is needed later.
