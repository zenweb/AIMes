# 2026-06-30 Scanner E2E Demo Context / Clickability Closure

## Scope

- `src/frontend/src/components/scanner/ScannerBoard.vue`
- `src/frontend/tests/e2e/scanner.spec.ts`

## Root Cause

Scanner E2E exposed two real-browser issues:

- Scanner context navigation did not preserve offline demo intent, so downstream Production pages could miss demo fallback behavior.
- The scan history list could overlap scan result action buttons and intercept pointer events at the test viewport.

## Changes

- Scanner context navigation now carries `offlineDemo=1` when the current page is in offline demo mode.
- Scanner result cards and action buttons have stable stacking above scan history.
- Scanner E2E setup and cross-module navigation now explicitly use `offlineDemo=1`.

## Verification

- `npm run test:e2e -- tests/e2e/scanner.spec.ts`: 8 passed.

## Remaining Risk

Full frontend E2E still needs another complete run. The previous full-suite attempt timed out and latest closed modules are Scheduling and Scanner.
