# Plan - Labor Retry Failure Audit

## Success Criteria
- Labor evidence startup retry success remains covered.
- Retry failure remains fail-loud and actionable.
- No unrelated worktree changes are staged accidentally.

## Steps
1. Inspect staged `ScheduleBoard` retry behavior.
2. Identify the missing retry-failure assertion.
3. Add a focused unit regression check.
4. Run `schedule-board.test.ts`.
5. Leave staging unchanged because the target test file has unrelated unstaged changes.

## Status
- Completed for local audit evidence.
- Not staged into the release-candidate slice.
