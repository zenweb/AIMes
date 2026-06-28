# 2026-06-13 Changelog: Production API contract evidence

## Changed

- Added frontend unit evidence for production API backend contract paths.
- Covered work-order query params, scan payload, start payload, complete payload, and exception payload.
- No production code was changed; the existing API helper behavior already matched the expected contract.

## Verification

- `npm run test:unit -- tests/unit/production-api.test.ts` => 2 passed.
- `npm run test:unit -- tests/unit/production-api.test.ts tests/unit/production-board.test.ts` => 25 passed.
- `npm run test:unit:coverage` => 90 files passed, 618 tests passed, frontend line coverage 79.56%.

## Note

The focused coverage run for `production-api.test.ts` does not list `src/api/production.ts` because the HTTP module is mocked. Treat this slice as contract evidence, not a direct line-coverage claim.

