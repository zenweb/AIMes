# 2026-06-15 Changelog: BOM ECN approval release evidence

- Added unit coverage for the successful BOM ECN approval path.
- Verified approval locks the ECN decision, shows release evidence, exposes the approval audit id, updates the AI scheduling bridge, and removes pending approve/reject actions.
- Production code was unchanged; the existing approval path already satisfies the behavior.

Validation:

- `npm run test:unit -- tests/unit/bom-board.test.ts -t "locks the ECN decision"`: 1 passed.
- `npm run test:unit -- tests/unit/bom-board.test.ts`: 14 passed.
- `npm run test:unit:coverage -- tests/unit/bom-board.test.ts`: 14 passed; `BomBoard.vue` line coverage `80.49%`.
