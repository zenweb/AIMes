# 2026-06-22 Review: Labor + Agent E2E clean worktree validation

Artifacts:
- Labor staged patch: `tmp/schedule-labor-evidence-retry-staged-20260622.patch` (93904 bytes).
- Combo worktree: `tmp/combo-labor-agent-20260622`.
- Validated combo patch: `tmp/combo-labor-agent-e2e-20260622.patch` (20627 bytes).

Validation evidence:
- Labor staged patch applied cleanly to the detached worktree.
- Agent patch direct apply check failed on `src/frontend/tests/e2e/scheduling.spec.ts`, proving manual merge was required.
- `git diff --check -- src/frontend/scripts/e2e.mjs src/frontend/tests/e2e/scheduling.spec.ts src/frontend/src/api/executionEvidence.ts src/frontend/src/components/schedule/ScheduleBoard.vue src/frontend/src/utils/labor-assignment-sync.ts`: PASS with CRLF warnings only.
- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/execution-evidence-api.test.ts`: 2 files / 27 tests PASS in the clean combo worktree.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试|人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`: 6 chromium tests PASS.

Audit conclusion:
- Agent E2E is a viable next slice after labor retry, but it needs manual hunk integration rather than blind patch application.
- The clean combination proves the two slices can coexist when offline/live E2E routing is unified.
- Ambient worktree boundary script output is intentionally not used as a pass gate for this combo because it includes unrelated dirty files from the broader worktree.
- Focused exported-patch boundary report `release-candidate-slice-hunk-map-20260622-labor-agent-combo-patch-focused.md` passed: 12 patch hunks, no excluded-theme token hits.

Non-claims:
- This does not stage Agent E2E in the main worktree.
- This does not prove full `scheduling.spec.ts`.
- This does not prove v1.0.0 completion.
