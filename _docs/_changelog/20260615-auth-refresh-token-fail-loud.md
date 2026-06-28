# 2026-06-15 Auth Refresh Token Fail Loud

## Changed

- Rejected backend login responses with blank refresh tokens before persisting auth state.
- Prevented partial auth evidence where an access token and user are saved without a usable refresh token.

## Verification

- Red/green: `npm run test:unit -- tests/unit/auth.store.test.ts --reporter=dot` first failed on blank backend `refreshToken`, then passed 11/11 after the fix.
- Regression slice: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 29/29.

