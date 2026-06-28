# Production scanned quality-fail freeze review

## Scope

- Files reviewed: `src/frontend/src/components/production/ProductionBoard.vue`, `src/frontend/tests/unit/production-board.test.ts`.
- This slice targets the scanned completion quality-fail branch only.

## Findings

- The implementation already writes the required nonconformance chain: quality gate active, rework, handoff freeze, CAPA, isolation, rework cost, and label hold.
- The previous success-path scanned completion test covered only quality-pass handoff evidence.
- The new test locks the operator-visible evidence chips and prevents a regression where a failed quality gate could still look like a normal handoff.

## Verification

- Initial test selector hit the page status filter instead of the completion-dialog quality select; the test was narrowed to the modal dialog and then passed.
- Targeted test, full ProductionBoard unit suite, production API tests, and targeted coverage suite pass.
