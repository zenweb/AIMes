# 2026-06-15 Changelog: RiskActionQueuePanel assistant recovery coverage

## Changed

- Added focused unit evidence for `RiskActionQueuePanel` cross-module risk source hydration.
- Covered production anomaly events entering the risk queue.
- Covered closed AI assistant recovery packages showing purchase and quality responsibility notes.
- Covered active quality-only assistant recovery packages staying escalated with quality evidence.

## Verification

- Before this slice, focused `RiskActionQueuePanel` coverage was: statements 84.67%, branches 44%, functions 84.21%, lines 88%.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` => 1 file passed, 13 tests passed.
- `npm run test:unit:coverage -- tests/unit/risk-action-queue-panel.test.ts --coverage.include=src/components/risk/RiskActionQueuePanel.vue` => statements 86.86%, branches 73%, functions 89.47%, lines 89.6%.

## Notes

- No production component logic was changed.
- This slice intentionally stops after the high-leverage cross-module source branches; the remaining uncovered lines are lower-value error/closure combinations.
