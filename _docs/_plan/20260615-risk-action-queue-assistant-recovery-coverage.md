# 2026-06-15 Plan: RiskActionQueuePanel assistant recovery coverage

## Goal

Harden the existing risk queue so cross-module production and assistant recovery sources remain visible and auditable.

## Success Criteria

- Production anomaly events render as risk cards with operation, work order, and suggested action evidence.
- Closed assistant recovery packages render purchase and quality responsibility closure notes.
- Active quality-only assistant recovery packages remain escalated and show quality evidence.
- Focused branch coverage improves meaningfully without changing production code.

## Result

- Added three focused tests to `src/frontend/tests/unit/risk-action-queue-panel.test.ts`.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/risk-action-queue-panel.test.ts --coverage.include=src/components/risk/RiskActionQueuePanel.vue` reported statements 86.86%, branches 73%, functions 89.47%, lines 89.6%.

## Next Route

Continue choosing low-coverage, user-critical existing paths. Do not over-optimize remaining low-value branches unless they protect a real operator workflow.
