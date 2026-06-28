# 2026-06-15 Router Auth User Evidence Required

## Changed

- Required both a nonblank access token and a cached user payload for protected route entry.
- Kept login-page redirection consistent with the stricter authenticated-state definition.

## Verification

- Red/green: `npm run test:unit -- tests/unit/router-auth.test.ts --reporter=dot` first failed when only a token was present, then passed 13/13 after the fix.
- Regression slice: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 30/30.

