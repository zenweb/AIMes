# 2026-06-15 Plan - Local User Invalid Cache Clear

## Success Criteria

- Incomplete cached users are removed from local storage.
- Local-user/auth/router focused regression remains green.
- Full frontend unit suite remains green.

## Execution

1. Add a failing assertion for invalid cache cleanup.
2. Remove incomplete cached user entries when rejected.
3. Re-run focused and full frontend unit tests.

## Outcome

- Criteria met by focused local-user/auth/router regression and full frontend unit regression.

