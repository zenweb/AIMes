# 2026-06-15 Review - Auth Demo Username Normalization

## Scope

- `src/frontend/src/stores/auth.ts`
- `src/frontend/tests/unit/auth.store.test.ts`

## Review Result

- Offline demo login now stores the normalized username used for account lookup.
- Backend login behavior is unchanged.
- Auth boot normalization and logout behavior remain covered by the existing store tests.

## Residual Risk

- This is a focused auth-state quality slice only. It does not claim full release completion or close the deferred gray observation gate.

## Verification

- `npm run test:unit -- tests/unit/auth.store.test.ts --reporter=dot` -> PASS, 8/8.
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 26/26.

