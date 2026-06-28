# Report quality rework impact coverage

## Changed

- Added unit coverage for quality rework impact evidence rendering in `ReportBoard`.
- Made the `readQualityReworkImpactBackendFirst` test mock controllable so report tests can prove the quality-to-OTD evidence path.
- Confirmed existing production code already renders the quality rework impact block; no component implementation change was required.

## Validation

- `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces quality rework impact"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 20 passed.
- `npm run test:unit -- tests/unit/quality-rework-impact-panel.test.ts`: 2 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 20 passed; `ReportBoard.vue` lines 78.54%.
