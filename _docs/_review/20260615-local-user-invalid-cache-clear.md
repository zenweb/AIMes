# 2026-06-15 Review - Local User Invalid Cache Clear

## Scope

- `src/frontend/src/utils/local-user.ts`
- `src/frontend/tests/unit/local-user.test.ts`

## Review Result

- Incomplete cached identity evidence is now removed when rejected by `getLocalUser()`.
- Fallback helpers remain tolerant for display/report actor reads.
- Full frontend unit regression stayed green.

## Residual Risk

- This is frontend unit evidence only. Real-browser auth evidence is still separate from this slice.

## Verification

- `npm run test:unit -- tests/unit/local-user.test.ts --reporter=dot` -> PASS, 6/6.
- `npm run test:unit -- tests/unit/local-user.test.ts tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 37/37.
- `npm run test:unit -- --reporter=dot` -> PASS, 111 test files / 976 tests.

