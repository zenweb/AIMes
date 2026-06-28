# 2026-06-15 Plan - Local User Complete Identity Required

## Success Criteria

- `getLocalUser()` returns `null` for incomplete cached users.
- Display/report fallback helpers still avoid blank actor names.
- Auth/router regression tests remain green.

## Execution

1. Add a failing local-user test for incomplete cached user payloads.
2. Require complete identity fields in `getLocalUser()`.
3. Re-run focused local-user/auth/router regression tests.

## Outcome

- Criteria met by the focused local-user test and related auth/http/router regression run.

