# Changelog - Formal Writeback Hunk Map

## Changed

- Added a focused hunk map for the unstaged formal schedule writeback trace work.
- Marked direct keep hunks for pending/saved writeback state in the workbench, board, unit tests, and scheduling E2E.
- Marked unrelated ScheduleBoard hardening hunks for deferral into separate packages.

## Validation

- Read-only diff inspection with `rg` and `git diff` context.
- Current dirty worktree behavior recheck:
  - `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts`
    - PASS: 2 files, 82 tests.
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单 Agent 采纳后区分反馈与正式排产回写" --project=chromium`
    - PASS: 1 Chromium test.
- No business code was staged or changed by this mapping step.

## Boundary

The staged Agent E2E package remains separate. Formal writeback is still unstaged and requires hunk-level packaging before release review.
