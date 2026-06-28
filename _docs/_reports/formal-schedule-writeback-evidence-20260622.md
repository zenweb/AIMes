# Formal schedule writeback evidence - 2026-06-22

## Scope

This package separates two states after a rush-order Agent adoption:

- feedback/adoption record is saved for audit and model review;
- formal schedule execution remains pending until an optimization or drag-save writes back the actual schedule plan.

## Implemented evidence

- `ScheduleAgentWorkbenchPanel` receives `formalScheduleWriteback: 'pending' | 'saved'`.
- The execution trace keeps `执行回写` in `current` when rush-order Agent feedback was accepted but the formal schedule is not saved.
- The execution trace marks `执行回写` as `done` after the formal schedule is saved.
- `ScheduleBoard` sets formal writeback to `pending` when the accepted feedback reason is `rush_event_agent`.
- `ScheduleBoard` sets formal writeback to `saved` after successful optimization or drag reschedule persistence.
- Drag-save success now updates both start and end windows locally and announces the saved window through an `aria-live` status.

## Verification

Focused unit verification:

```text
npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts

Test Files  2 passed (2)
Tests       82 passed (82)
```

Focused Chromium verification:

```text
npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单 Agent 采纳后区分反馈与正式排产回写" --project=chromium

1 passed
```

Cached package check:

```text
git diff --cached --check
PASS
```

## Boundary

- This package intentionally excludes broad ScheduleBoard hardening and unrelated event-adoption tests still present in the dirty worktree.
- `src/frontend/src/components/schedule/ScheduleBoard.vue`, `src/frontend/tests/unit/schedule-board.test.ts`, and `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts` still have unstaged changes outside this package.
- The staged `src/frontend/tests/e2e/scheduling.spec.ts` includes the previously staged Agent E2E package plus this formal-writeback focused E2E.
