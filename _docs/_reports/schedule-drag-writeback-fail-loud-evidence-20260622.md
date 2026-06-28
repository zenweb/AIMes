# 2026-06-22 Schedule Drag Writeback Fail-Loud Evidence

## Scope
- Drag reschedule no longer silently returns when the task id cannot be mapped to a writable Gantt task.
- Drag reschedule no longer silently returns when the current schedule plan lacks an id.
- Successful drag save continues to mark formal schedule writeback as saved and announces the saved time window.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
  - Result: PASS
  - Files: 1 passed
  - Tests: 76 passed
- `git diff --cached --check`
  - Result: PASS

## Boundaries
- This slice covers the drag writeback path only.
- Broader schedule event evidence refresh and assistant handoff refresh work remain separate unstaged candidates.
