# 2026-06-15 Plan - Router Auth Role Evidence Required

## Success Criteria

- Token plus cached user without role is not enough for protected route entry.
- Missing-role sessions redirect to login.
- Existing auth store and router tests remain green.

## Execution

1. Add a failing router test for missing role on an ordinary protected route.
2. Require `getLocalUserRole()` in the authenticated-state check.
3. Update the role-restricted missing-role expectation to login.
4. Re-run focused auth/router regression tests.

## Outcome

- Criteria met by the focused router test and related auth/http/router regression run.

