# 2026-06-19 Changelog: Production scan API barcode context

## Changed
- Manual production scans that resolve through the scan API now build the same barcode production context as route `scanCode` entry.
- Operators can continue from a successful scanned operation into the barcode start context instead of only seeing the located operation.
- Added coverage that confirmed local barcode scan evidence is used when route `scanCode` enters production reporting.

## Evidence
- RED: `npm run test:unit -- tests/unit/production-board.test.ts -t "selects the scanned work order and announces the matched operation"` first failed because `.barcode-start-context` was missing after scan API success.
- GREEN: targeted tests passed.
- Component suite: `npm run test:unit -- tests/unit/production-board.test.ts` passed, 38 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1110 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 still depends on first gray observation and the two-week no P0/P1 window.
