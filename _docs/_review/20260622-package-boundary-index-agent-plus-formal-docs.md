# Review - Package Boundary Index Agent Plus Formal Docs

## Current Index Boundary

The current index contains:

- Agent E2E code and verification packet.
- Formal writeback hunk-map and patch-draft documentation.

The current index does not contain formal-writeback business code.

## Why This Boundary Exists

The formal-writeback behavior is verified in the dirty worktree, but its source/test diff remains mixed with broader ScheduleBoard changes. The documentation is staged so the audit trail is preserved, while the code remains unstaged until manual hunk-level packaging is performed.

## Explicit Non-Claims

- The staged package does not implement formal writeback as a clean release slice.
- `ScheduleAgentWorkbenchPanel.vue`, `ScheduleBoard.vue`, `schedule-agent-workbench-panel.test.ts`, and `schedule-board.test.ts` formal-writeback hunks are still unstaged.
- `src/frontend/tests/e2e/scheduling.spec.ts` remains `MM`; staged Agent E2E hunks must be preserved while formal-writeback hunks stay unstaged until split.

## Required Next Step

Either:

1. Commit or otherwise seal the current Agent E2E package plus formal split-planning docs, then rebuild the index for formal-writeback code, or
2. Manually hunk-stage formal-writeback code and re-audit the enlarged package boundary before claiming it as a combined package.
