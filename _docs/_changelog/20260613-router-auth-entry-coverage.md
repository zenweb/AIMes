# 2026-06-13 Changelog: Router auth entry coverage

## Changed

- Added router guard unit evidence for authenticated users who revisit `/login`.
- Added router guard unit evidence for operator users attempting to enter the engineering-only `/scheduling` route.
- No production code was changed; the existing guard behavior already satisfied both user-critical entry rules.

## Verification

- `npm run test:unit -- tests/unit/router-auth.test.ts` => 5 passed.
- `npm run test:unit:coverage -- tests/unit/router-auth.test.ts` => 5 passed; `src/router/index.ts` line coverage in the focused run is 57.5%.

