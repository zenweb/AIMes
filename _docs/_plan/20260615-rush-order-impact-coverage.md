# 2026-06-15 Plan: RushOrderImpactPanel coverage

## Goal

Harden an existing user-critical scheduling path by adding focused evidence for urgent-order impact display without expanding product scope.

## Success Criteria

- `RushOrderImpactPanel` has an independent unit test file.
- Tests assert the scheduler-facing impact summary and recommended option state.
- Focused coverage for the component reaches 100%.
- No production component code changes are required unless tests expose a real defect.

## Result

- Added focused unit tests for constrained rush insertion and no-downstream-impact insertion.
- `npm run test:unit -- tests/unit/rush-order-impact-panel.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/rush-order-impact-panel.test.ts --coverage.include=src/components/schedule/RushOrderImpactPanel.vue` reported 100% statements, branches, functions, and lines.

## Next Route

Continue using coverage leverage: choose the next lowest-coverage existing component on a user-critical path, while keeping live browser evidence on host `5002`.
