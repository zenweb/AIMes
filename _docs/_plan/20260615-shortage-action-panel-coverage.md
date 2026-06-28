# 2026-06-15 Plan: ShortageActionPanel coverage

## Goal

Harden the existing purchase shortage action panel with direct component evidence, keeping the work scoped to current behavior.

## Success Criteria

- `ShortageActionPanel` has a matching unit test file.
- Tests assert shortage evidence display for open, ordered, and mitigated states.
- Tests assert receipt is disabled until an expedite order exists.
- Tests assert expedite, alternate material, and receive events.
- Focused coverage reaches 100%.

## Result

- Added `src/frontend/tests/unit/shortage-action-panel.test.ts`.
- `npm run test:unit -- tests/unit/shortage-action-panel.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/shortage-action-panel.test.ts --coverage.include=src/components/purchase/ShortageActionPanel.vue` reported 100% statements, branches, functions, and lines.
- Full frontend unit coverage passed with 110 test files and 851 tests.

## Next Route

Use the current full coverage table to pick the next low-coverage, user-critical existing path. Component direct-test filename gaps are closed by the current scan.
