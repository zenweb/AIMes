# Issue: Schedule workbench lacked pre-action guidance links

Date: 2026-06-19

## Problem

The AI scheduling workbench had deep optimization, adoption, and writeback flows, but the top-level work surface did not provide a concise bilingual pre-action prompt or direct links to related evidence/help.

## Impact

Operators could enter complex scheduling actions without a clear reminder to confirm objective, lock window, evidence trail, and writeback path. This weakened the new core product principles for multilingual support, related UI links, and complex-operation support prompts.

## Resolution

Added a guidance section with English/Simplified Chinese copy, links to audit replay and delivery reporting, and a local help anchor for scheduling operations.

## Evidence

- `npx vitest run tests/unit/schedule-board.test.ts --coverage.enabled=false -t "guides scheduler operators"` RED then GREEN.
- `npx vitest run tests/unit/schedule-board.test.ts --coverage.enabled=false` passed.
- `npm run test:unit:coverage` passed: 111 files / 1083 tests.
- `npm run lint` passed.
- `npm run build` passed on the current worktree.
