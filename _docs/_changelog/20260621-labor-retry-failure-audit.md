# 2026-06-21 Labor Retry Failure Audit

- Added a focused unit regression check for the schedule labor evidence retry path.
- The new check verifies that if startup labor evidence loading fails and the operator retry also fails, the warning returns with the retry failure reason and the retry action remains available.
- This is an audit hardening check for the existing staged `schedule-labor-evidence-retry` slice; it is not staged because `schedule-board.test.ts` currently contains unrelated unstaged worktree changes.

## Verification
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: 76/76 passed.
