# 2026-06-19 Review: Production scan API barcode context

## Scope
- Reviewed `ProductionBoard` scan API success flow and barcode evidence consumption.

## Finding
- Route `scanCode` entry built a barcode production context, but manual scan API success returned immediately after locating the operation.
- This left operators without the barcode context actions after a successful manual scan, even though the operation was selected.

## Resolution
- Added barcode context construction in the scan API success branch for work-order barcode values.
- Kept non-work-order operation lookup behavior unchanged.
- Added test coverage for confirmed local barcode evidence being shown in production route entry.

## Verification
- Targeted RED/GREEN test.
- `npm run test:unit -- tests/unit/production-board.test.ts`: 38 passed.
- `npm run test:unit:coverage`: 111 files / 1110 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.

## Residual Risk
- This verifies unit-level UI behavior. Real browser evidence for scan page -> production page -> barcode start flow remains a follow-up.
