# Issue - Labor Retry Staged Boundary Pass

The staged boundary is green, but the staged candidate is not complete.

Cause:

- The labor retry E2E/runner hunks can be isolated cleanly.
- The `ScheduleBoard.vue` implementation hunks remain mixed with unrelated assistant engineering, feedback readback, real dhtmlx adjacent state, and guidance-link changes.

Risk:

- Pushing the current staged diff would add E2E expectations without staging the corresponding product implementation.

Resolution:

- Continue manual staging of only the `ScheduleBoard.vue` labor evidence startup/retry code.

