# 2026-06-16 BOM Startup Evidence Aggregate Coverage

- Added direct regression coverage for `BomBoard.vue` startup engineering evidence aggregation.
- Covered simultaneous backend-first failures for:
  - alternate material approval evidence,
  - BOM kitting package evidence.
- Locked the behavior that the BOM list remains usable while both startup evidence failures stay visible in one fail-loud alert.
- Production code was not changed.

## Verification

- `npm run test:unit -- tests/unit/bom-board.test.ts --reporter=dot`
  - `1 file / 20 tests passed`.
- `npm run test:unit:coverage -- tests/unit/bom-board.test.ts --reporter=dot --coverage.reporter=text`
  - `BomBoard.vue`: statements `83.27%`, branches `75%`, functions `92%`, lines `88.11%`.
- `npm run test:unit -- tests/unit/bom-board.test.ts tests/unit/engineering-constraint-panel.test.ts tests/unit/engineering-constraint-otd-evidence-sync.test.ts tests/unit/shortage-risk-sync.test.ts tests/unit/otd-evidence-api.test.ts --reporter=dot`
  - Vitest executed `4 files / 36 tests passed`; one requested path did not add an executed file in this command.
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1035 tests passed`.
  - overall statements `88.78%`, branches `76.04%`, functions `88.46%`, lines `91.96%`.
