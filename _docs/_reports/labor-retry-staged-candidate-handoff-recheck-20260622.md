# Labor Retry Staged Candidate Handoff Recheck - 2026-06-22

Candidate:
- `schedule-labor-evidence-retry`

Validation commands:
- `git diff --cached --check`
- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/execution-evidence-api.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试|人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件"`

Results:
- Cached diff check: PASS.
- Unit: 3 files / 89 tests PASS.
- E2E: 3 chromium tests PASS.

Boundary status:
- Staged candidate unchanged during this recheck.
- Agent E2E patch remains external at `tmp/agent-e2e-slice-20260622.patch`.
- Direct patch application check currently fails against the dirty main tree, so Agent E2E needs manual hunk integration later.
- Main worktree remains dirty; avoid broad staging.
