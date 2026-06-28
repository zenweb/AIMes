# 2026-06-15 Auth Backend Identity Normalization

## Changed

- Normalized backend login identity fields before storing auth state.
- Kept backend token and refresh token normalization unchanged.

## Verification

- Red/green: `npm run test:unit -- tests/unit/auth.store.test.ts --reporter=dot` first failed on unnormalized backend `username`, `displayName`, and `role`, then passed 9/9 after the fix.
- Regression slice: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 27/27.

