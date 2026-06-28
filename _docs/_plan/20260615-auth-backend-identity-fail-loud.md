# 2026-06-15 Plan - Auth Backend Identity Fail Loud

## Success Criteria

- Blank backend identity fields are rejected after normalization.
- Invalid auth responses do not persist token or user state.
- Existing auth refresh and router tests remain green.

## Execution

1. Add a failing auth store test for blank backend identity fields.
2. Reject invalid normalized auth responses before saving state.
3. Re-run focused auth and related regression tests.

## Outcome

- Criteria met by the focused auth store test and related auth/http/router regression run.

