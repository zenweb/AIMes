# 2026-06-15 Audit Replay Quality Experiment Candidate Evidence Next Actions

- [x] Add a direct regression test for quality experiment candidate replay.
- [x] Verify the targeted unit test passes.
- [x] Verify related replay regression passes.
- [x] Verify full frontend coverage passes.
- [ ] On resume, inspect whether `AuditDecisionReplayPanel.vue` still has any user-critical replay branch without a direct regression test.
- [ ] Keep backend/staging work on port `5003` if it is needed later.
