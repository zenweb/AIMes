# Production scanned quality-fail freeze issue note

## Issue

Scanned completion had success-path coverage for material, quality, and handoff evidence, but no dedicated regression test for the quality-fail branch.

## Impact

- A regression could allow a failed quality gate to miss rework/freeze/CAPA/isolation/cost/label evidence.
- Operators could lose the on-screen distinction between normal handoff and quality-frozen handoff.

## Resolution

- Added a scanned completion quality-fail test with defect quantity and failed inspection result.
- Verified that the handoff evidence is not shown, while rework, hold, CAPA, isolation, rework-cost, and label-hold evidence are shown.
