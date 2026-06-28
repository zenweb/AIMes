# 2026-06-15 Issue: ShortageActionPanel direct evidence gap

## Problem

`ShortageActionPanel` did not have a direct unit test file, even though it is the purchase-side action surface for a scheduling material shortage.

## Impact

- The UI contract for shortage status labels, shortage quantities, alternate material evidence, trace display, and receipt gating could regress without a focused component test.
- Parent-board tests covered some behavior indirectly, but direct component evidence was missing.

## Resolution

- Added `shortage-action-panel.test.ts`.
- Covered open, ordered, and mitigated shortage states plus expedite/alternate/receive events.

## Verification

- Target unit: 3/3 passed.
- Focused coverage: 100% statements, branches, functions, and lines.
- Full frontend unit coverage remains green: 110 files passed, 851 tests passed.
