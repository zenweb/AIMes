# 2026-06-15 Auth Router Full Unit Regression

## Changed

- Recorded a full frontend unit regression after the auth/router/local-user hardening slices.
- No production code changed in this audit slice.

## Verification

- `npm run test:unit -- --reporter=dot` -> PASS, 111 test files / 976 tests.

