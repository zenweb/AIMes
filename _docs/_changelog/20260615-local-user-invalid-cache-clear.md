# 2026-06-15 Local User Invalid Cache Clear

## Changed

- Cleared incomplete cached user payloads when `getLocalUser()` rejects them.
- Prevented repeated reuse of the same invalid `aimes_user` evidence across route/auth checks.

## Verification

- Red/green: `npm run test:unit -- tests/unit/local-user.test.ts --reporter=dot` first failed because invalid cache remained in storage, then passed 6/6 after the fix.
- Focused regression: `npm run test:unit -- tests/unit/local-user.test.ts tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 37/37.
- Full frontend regression: `npm run test:unit -- --reporter=dot` -> PASS, 111 test files / 976 tests.

