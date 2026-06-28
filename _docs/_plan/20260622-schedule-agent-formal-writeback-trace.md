# Plan - Schedule Agent Formal Writeback Trace

## Success Criteria

- Agent event adoption feedback remains visible as decision/audit evidence.
- Formal schedule writeback remains `pending` until an actual plan writeback succeeds.
- Successful optimization changes the workbench execution state to `saved`.
- Successful drag reschedule changes the workbench execution state to `saved`.
- Tests prove the parent-child contract between `ScheduleBoard` and `ScheduleAgentWorkbenchPanel`.

## Execution

1. Use `ScheduleBoard` as the source of truth for formal writeback status.
2. Pass the status into `ScheduleAgentWorkbenchPanel`.
3. Keep the panel copy explicit: feedback dataset and formal plan writeback are different stages.
4. Verify with focused unit tests.

## Status

Implemented in current worktree, not staged into the active Agent E2E package.
