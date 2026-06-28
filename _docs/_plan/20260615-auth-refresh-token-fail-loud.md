# 2026-06-15 Plan - Auth Refresh Token Fail Loud

## Success Criteria

- Blank backend refresh token responses are rejected.
- Invalid login responses do not persist partial auth state.
- Existing auth refresh and router tests remain green.

## Execution

1. Add a failing auth store test for blank backend `refreshToken`.
2. Validate the refresh token before saving auth state.
3. Re-run focused auth and related regression tests.

## Outcome

- Criteria met by the focused auth store test and related auth/http/router regression run.

