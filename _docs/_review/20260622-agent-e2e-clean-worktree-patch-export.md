# 2026-06-22 Review: Agent E2E clean worktree patch export

Evidence:
- Temp worktree path: `tmp/agent-e2e-slice-20260622`.
- Exported patch: `tmp/agent-e2e-slice-20260622.patch`.
- Patch size: 7257 bytes.
- Verified commands in the clean worktree:
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"` passed 3/3.
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "展示调度员 Agent 工作台|调度员 Agent 工作台提供后端建议|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"` passed 5/5.
  - `git diff --check` passed with CRLF warnings only.

Review notes:
- The fix is isolated and directly addresses the Agent E2E live/offline routing regression.
- It avoids broad backend mocking by preserving the Agent recommend/adopt paths for the scenario under test.
- It is not yet staged in the main repository because the main `scheduling.spec.ts` is already mixed (`MM`) and unsafe for blind patch application.

Residual risk:
- Full `scheduling.spec.ts` is not claimed green.
- Main-tree integration still needs a hunk map once the current staged candidate boundary is resolved.
