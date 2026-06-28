# 2026-06-15 Plan - Auth Backend Identity Normalization

## Success Criteria

- Backend login returns a user whose identity fields are normalized.
- Persisted `aimes_user` uses the same normalized identity fields.
- Existing auth refresh and router auth tests remain green.

## Execution

1. Add a failing auth store test for whitespace in backend identity fields.
2. Trim backend login identity fields when building `AuthUser`.
3. Re-run focused auth and related regression tests.

## Outcome

- Criteria met by the focused auth store test and related auth/http/router regression run.

