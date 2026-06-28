# Production scanned exception evidence fail-loud review

## Scope

- Files reviewed: `src/frontend/src/components/production/ProductionBoard.vue`, `src/frontend/tests/unit/production-board.test.ts`.
- This slice covers the scanned production exception path only.

## Findings

- The ordinary exception evidence failure branch was already covered.
- The scanned exception path had no dedicated regression test proving barcode anomaly evidence failures are surfaced after backend exception submission.
- The existing implementation already catches failures from barcode anomaly evidence archival and shows the fail-loud notification, so production code was left unchanged.

## Verification

- A first broad mock failed for the wrong reason because start evidence consumed the one-shot mock; the test was corrected to throw only for `barcode-anomaly-WO-RUSH-9001-OP-10`.
- Targeted test, full ProductionBoard unit suite, production API contract tests, and targeted coverage suite pass.
