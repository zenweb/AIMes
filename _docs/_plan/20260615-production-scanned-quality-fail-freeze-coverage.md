# Production scanned quality-fail freeze coverage plan

## Success criteria

- Scanned completion with failed quality gate calls completion API with failed inspection data.
- Quality gate remains active and does not generate normal handoff evidence.
- Rework, handoff freeze, CAPA, isolation, rework cost, and label hold records are written.
- Operator-visible barcode context shows each nonconformance trace.

## Steps

1. Inspect scanned completion implementation and existing tests.
2. Add a targeted test for failed quality gate and nonconformance evidence.
3. Fix implementation only if the branch is missing.
4. Run targeted, component, API, and coverage validation.

## Result

Completed for this slice. Existing production code already met the behavior; the missing piece was regression evidence.
