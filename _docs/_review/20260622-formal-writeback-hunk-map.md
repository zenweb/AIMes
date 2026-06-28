# Review - Formal Writeback Hunk Map

## Finding

Formal writeback can be split into a clean package, but only with hunk-level staging.

The current unstaged diff contains direct formal-writeback behavior plus unrelated ScheduleBoard hardening. Whole-file staging would mix scopes and weaken review evidence.

## Evidence

- `ScheduleAgentWorkbenchPanel.vue` has a small, direct prop and execution trace change.
- `ScheduleBoard.vue` has direct writeback state transitions, but the same file also contains guidance, startup fail-loud, backend-first evidence, outsourcing, and assistant recovery changes.
- `schedule-board.test.ts` contains direct formal-writeback tests plus a much broader set of unrelated tests and mock refactors.
- `scheduling.spec.ts` is `MM`, so hunk staging must preserve staged Agent E2E evidence.
- Current dirty worktree behavior recheck passed:
  - unit: 2 files, 82 tests.
  - E2E: focused formal-writeback Chromium test.

## Decision

Do not stage formal writeback until the hunk map is applied. Package only direct pending/saved formal writeback behavior and its direct tests.
