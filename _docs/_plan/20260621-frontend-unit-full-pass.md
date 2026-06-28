# 2026-06-21 Frontend Unit Full Pass Plan

## Objective

Close the frontend unit-test validation layer for the current dirty worktree.

## Completed

- Reproduced full-suite instability.
- Separated command/environment instability from real assertion failures.
- Fixed the three stale/fragile frontend unit test expectations.
- Verified full frontend unit suite with low-concurrency execution.

## Next

- Run frontend coverage baseline with the same low-concurrency constraint if supported.
- Continue real-browser evidence against user-critical routes, starting from live employee and scheduling paths.
- Do not claim hosted CI coverage for dirty local changes until pushed and revalidated.
