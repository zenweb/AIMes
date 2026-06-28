# 2026-06-15 Admin governance startup payload shape

## Changed

- Added regression coverage for AdminBoard startup governance evidence when an array-backed backend payload returns an object.
- Added `ensureAdminEvidenceArray` to fail loud on non-array governance evidence payloads during startup.
- Applied the shape guard to array-backed Agent governance evidence loaders so bad payloads do not enter reactive list state.

## Verification

- RED: `npm run test:unit -- tests/unit/admin-board.test.ts --reporter=dot` failed because no startup alert was shown when Agent config approvals returned `{ items: [] }`.
- GREEN: `npm run test:unit -- tests/unit/admin-board.test.ts --reporter=dot` passed 1 file / 22 tests.
- Full coverage: `npm run test:unit:coverage -- --reporter=dot` passed 111 files / 966 tests.
- Regression refresh on 2026-06-19: `npm run test:unit:coverage` passed 111 files / 1083 tests.

## Coverage

- Total after this slice: statements 87.20%, branches 73.71%, functions 86.50%, lines 90.47%.
- `AdminBoard.vue`: statements 82.76%, branches 51.05%, functions 69.51%, lines 85.33%.
- Current `AdminBoard.vue` after subsequent hardening: statements 87.28%, branches 57.57%, functions 76.47%, lines 89.40%.

## Notes

- This keeps Admin Agent governance usable when a backend evidence endpoint returns the wrong payload shape.
- PostgreSQL/staging release evidence remains outside this frontend unit slice.
