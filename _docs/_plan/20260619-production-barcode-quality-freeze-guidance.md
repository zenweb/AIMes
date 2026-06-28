# 2026-06-19 Plan: Production barcode quality freeze guidance

## Success Criteria
- Quality-failed scanned completion must tell the operator that the barcode context is frozen.
- The message must coexist with existing rework, handoff freeze, CAPA, isolation, cost, and label-status evidence.
- Existing production component behavior must remain green.

## Execution
- Add RED assertion to the quality-fail scanned completion test.
- Add minimal `paused` state guidance in the barcode context actions.
- Run targeted test, production component suite, full coverage, lint, and build.

## Result
- Completed.
- Verification passed:
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "freezes scanned completion handoff and exposes rework evidence when quality gate fails"`
  - `npm run test:unit -- tests/unit/production-board.test.ts`
  - `npm run test:unit:coverage`
  - `npm run lint`
  - `npm run build`
