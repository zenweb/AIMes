# 2026-06-15 Audit Replay Schedule Feedback Load Fail Loud Next Actions

- [x] Add a direct regression test for schedule adoption feedback audit list loading failure.
- [x] Verify base replay cards remain visible.
- [x] Verify assertive alert text identifies the failed schedule feedback audit input.
- [x] Verify targeted and related replay tests pass.
- [x] Verify full frontend coverage passes.
- [ ] On resume, inspect remaining uncovered `AuditDecisionReplayPanel.vue` branches around POC evidence governance and backend business-write outer failure handling.
- [ ] Keep backend/staging work on port `5003` if it is needed later.
