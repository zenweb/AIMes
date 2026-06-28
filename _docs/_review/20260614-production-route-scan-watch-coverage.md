# Production route scan watch coverage review

## Scope

- Reviewed ProductionBoard route `scanCode` watcher behavior after initial load.
- Code changed only in `src/frontend/tests/unit/production-board.test.ts`.

## Findings

- Existing implementation correctly handles route scan-code changes after work orders are loaded.
- The previous route mock was static and could not exercise the watcher; making the test query reactive enabled coverage without changing production code.
- The new test verifies both list preservation and new barcode context selection, so it protects the handoff from other modules into production reporting.

## Verification

- ProductionBoard targeted unit tests passed.
- Production API targeted unit tests passed.
- Targeted and full frontend coverage passed.

## Residual risk

- This does not prove Nuxt router navigation in a real browser.
- If the actual route path or navigation flow changes, run a browser slice against `/scheduling/production?scanCode=...`.
