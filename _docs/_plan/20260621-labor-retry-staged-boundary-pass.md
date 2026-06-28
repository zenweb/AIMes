# Plan - Labor Retry Staged Boundary Pass

Success criteria for this step:

- Staged candidate has no excluded-theme tokens.
- Staged hunk map has no mixed or excluded hunks.
- Any incompleteness is documented loudly.

Completed:

- Staged runner and E2E labor retry hunks only.
- Verified staged hunk map is all `KEEP_CANDIDATE`.
- Verified staged boundary guard passed.

Remaining:

- Stage the matching `ScheduleBoard.vue` labor implementation.
- Verify the final staged candidate in a clean runtime shape before push.
