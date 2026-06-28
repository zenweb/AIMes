# Schedule Agent Formal Writeback Trace - 2026-06-22

## Scope

Existing-feature hardening for the Scheduling Agent workbench.

This slice prevents a dispatcher from confusing Agent adoption feedback with a completed formal schedule plan writeback.

## Code Scope

- `src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts`
- `src/frontend/tests/unit/schedule-board.test.ts`

## Behavior

- Rush-order Agent adoption sets formal writeback to `pending`.
- The workbench execution trace shows that local/backend feedback exists, but the formal plan still needs optimization or drag-save.
- Successful optimization marks formal writeback as `saved`.
- Successful drag reschedule marks formal writeback as `saved` and announces the saved time window.

## Validation

```powershell
npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts
npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单 Agent 采纳后区分反馈与正式排产回写" --project=chromium
```

Result:

- PASS.
- 2 test files passed.
- 82 tests passed.
- 1 focused Chromium E2E test passed.

## Browser Evidence

Focused Chromium E2E now proves the real UI flow:

1. Generate the rush-order Agent recommendation.
2. Adopt the recommendation and verify the workbench stays at formal writeback `current` / pending.
3. Run schedule optimization and verify the workbench marks formal writeback `done`.

## Package Boundary

This slice is currently unstaged because the active index is the separate `scheduling-agent-e2e-current-worktree-verification` package.

Do not mix this formal-writeback trace slice into the active Agent E2E package unless the index is intentionally rebuilt.

## Non-Claims

- This is not full Scheduling E2E evidence.
- This is not full frontend baseline evidence.
- This does not close v1.0.0 because release gates remain broader than this UI correctness slice.
