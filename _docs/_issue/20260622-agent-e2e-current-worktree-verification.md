# Issue - Agent E2E Patch Application Drift

## Symptom

`git apply --check tmp/agent-e2e-slice-20260622.patch` fails on:

- `src/frontend/scripts/e2e.mjs`
- `src/frontend/tests/e2e/scheduling.spec.ts`

## Cause

The current worktree already contains later edits in the same files, including Agent backend-mock E2E setup and labor evidence retry setup.

## Resolution

Do not apply the stale patch directly. Verify the current worktree behavior instead.

## Status

Resolved for the bounded current-worktree verification slice. Current Agent E2E verification passed all three focused Agent backend scenarios, including `调度员 Agent 工作台 API 不可用时保留 demo fallback`.
