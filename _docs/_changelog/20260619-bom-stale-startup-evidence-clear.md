# Changelog: BOM stale startup evidence clear

Date: 2026-06-19

## Changed

- Fixed `BomBoard` so stale startup engineering evidence errors are cleared after a successful evidence refresh during BOM selection.
- Kept list, detail, explosion, and current operation failure messages scoped to their own error buckets.
- Added unit coverage proving a recovered engineering evidence source no longer leaves an obsolete startup alert visible.

## Verification

- RED: `npx vitest run tests/unit/bom-board.test.ts --coverage.enabled=false -t "clears stale startup engineering evidence errors"` failed because the old startup alert stayed visible after refresh succeeded.
- GREEN: the same targeted test passed after clearing the stale startup engineering evidence bucket on successful selection refresh.
- `npx vitest run tests/unit/bom-board.test.ts --coverage.enabled=false` passed: 22 tests.
- `npm run test:unit:coverage` passed: 111 files / 1080 tests.
- `npm run lint` passed.
