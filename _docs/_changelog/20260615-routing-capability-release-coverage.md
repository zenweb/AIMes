# 2026-06-15 Changelog: Routing capability release coverage

## Changed

- Added focused unit evidence for `RoutingBoard` capability-validation success paths.
- Covered saved capability validation history readback and Agent bridge wording that blocks scheduling release until split/batch confirmation.
- Covered successful capability validation evidence save, successful split/batch release evidence save, and pagination-driven route loading.

## Verification

- Full frontend baseline before this slice: `npm run test:unit:coverage -- --reporter=dot` => 111 files passed, 857 tests passed; global coverage statements 82.82%, branches 68.22%, functions 79.83%, lines 86.35%.
- Focused `RoutingBoard` coverage before this slice: statements 74.83%, branches 64.22%, functions 66.66%, lines 81.95%.
- `npm run test:unit -- tests/unit/routing-board.test.ts` => 1 file passed, 12 tests passed.
- `npm run test:unit:coverage -- tests/unit/routing-board.test.ts --coverage.include=src/components/routing/RoutingBoard.vue` => statements 85.8%, branches 77.98%, functions 85.18%, lines 90.97%.

## Notes

- No production component logic was changed.
- This hardens the existing engineering-route-to-scheduling release path rather than adding scope.
