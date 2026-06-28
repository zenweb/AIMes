# 2026-06-15 Auth Demo Username Normalization

## Changed

- Normalized offline demo login usernames before storing auth state.
- Prevented whitespace or case noise in demo credentials from leaking into `aimes_user`.

## Verification

- Baseline: `dotnet test src/backend/AIMes.slnx --no-restore -p:UseSharedCompilation=false` -> PASS, 765 passed, 0 failed, 0 skipped.
- Baseline: `npm run test:unit -- --reporter=dot` -> PASS, 111 files / 969 tests passed.
- Red/green: `npm run test:unit -- tests/unit/auth.store.test.ts --reporter=dot` first failed on unnormalized `"  Operator  "`, then passed 8/8 after the fix.
- Regression slice: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 26/26.

