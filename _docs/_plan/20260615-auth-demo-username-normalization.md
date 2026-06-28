# 2026-06-15 Plan - Auth Demo Username Normalization

## Success Criteria

- Demo login accepts whitespace/case variants of known demo accounts.
- Stored auth evidence uses the canonical demo username.
- Existing backend login and router auth behavior remain green.

## Execution

1. Add a failing auth store test for a whitespace/case demo username.
2. Normalize the stored demo username in `tryDemoLogin`.
3. Re-run the auth and related regression tests.

## Outcome

- Criteria met by the focused auth store test and related auth/http/router regression run.

