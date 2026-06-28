# 2026-06-15 Plan - Router Auth User Evidence Required

## Success Criteria

- Protected routes require both access token and cached user evidence.
- Login redirect behavior remains correct for authenticated users.
- Existing auth refresh and store tests remain green.

## Execution

1. Add a failing router test for token-only protected route access.
2. Tighten the router guard to require both token and user.
3. Re-run focused auth and router regression tests.

## Outcome

- Criteria met by the focused router test and related auth/http/router regression run.

