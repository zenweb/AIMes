# 2026-06-15 Todo - Auth Backend Identity Normalization

## Done

- Added a regression test for backend login identity normalization.
- Trimmed backend `username`, `displayName`, and `role` before storing auth evidence.
- Verified focused auth/http/router regression tests.

## Next Actions

- Continue selecting existing user-critical flows by coverage leverage.
- Prefer another low-risk core auth/router/session slice before broadening feature scope.
- Keep release-gate gray observation wording explicit as owner-deferred, not passed.

