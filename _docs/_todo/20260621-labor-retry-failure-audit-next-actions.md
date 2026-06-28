# TODO - Labor Retry Failure Audit Next Actions

- Before preparing a PR, split or isolate the `schedule-board.test.ts` audit hunk from unrelated unstaged changes.
- Keep the current staged labor retry slice intact unless intentionally adding this unit audit with a clean hunk split.
- Continue requiring the focused E2E retry success check plus the retry-failure unit check for this behavior.
