# 2026-06-19 Plan: Production scan API barcode context

## Success Criteria
- A successful manual work-order barcode scan through the production scan API must show barcode production context.
- Route `scanCode` entry must continue using confirmed local barcode scan evidence.
- Existing production start, completion, exception, race, and fail-loud tests must keep passing.

## Execution
- Add RED expectation to the manual scan API success test.
- Make the scan API success branch build barcode production context for work-order barcode input.
- Add coverage for confirmed local scan evidence in route `scanCode` entry.
- Run targeted tests, production component suite, full coverage, lint, and build.

## Result
- Completed.
- Verification passed:
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "selects the scanned work order and announces the matched operation"`
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "uses confirmed barcode scan evidence when route scanCode enters production reporting"`
  - `npm run test:unit -- tests/unit/production-board.test.ts`
  - `npm run test:unit:coverage`
  - `npm run lint`
  - `npm run build`
