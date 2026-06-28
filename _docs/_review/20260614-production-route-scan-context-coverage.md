# Production route scan context coverage review

## Scope

- Reviewed the ProductionBoard URL scan handoff path around `route.query.scanCode`, demo work-order insertion, selected work-order sync, and barcode production context rendering.
- Code changed only in `src/frontend/tests/unit/production-board.test.ts`.

## Findings

- Existing behavior already normalizes route scan codes and creates the expected production reporting context.
- Initial RED showed the test expected the manual-scan API shape (`scanOperation(code, operatorId)`), while the route path intentionally selects the work order and calls `scanOperation(wo.orderNumber)` through `selectWorkOrder`.
- The final test now matches the actual route handoff contract instead of forcing the manual scan contract.

## Verification

- ProductionBoard targeted unit tests passed.
- Production API targeted unit tests passed.
- Targeted and full frontend coverage passed.

## Residual risk

- This does not prove browser/router integration against a running Nuxt app.
- If route navigation behavior changes, a real-browser slice should verify `/scheduling/production?scanCode=...`.
