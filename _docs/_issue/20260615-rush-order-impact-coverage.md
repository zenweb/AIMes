# 2026-06-15 Issue: RushOrderImpactPanel coverage gap

## Problem

`RushOrderImpactPanel` had no independent unit test file, so its urgent-order insertion evidence path could regress without a focused component test.

## Impact

- Schedulers rely on this panel before committing a rush insertion.
- Missing focused evidence could hide regressions in delay, changeover, bottleneck, material, and recommendation display.

## Resolution

- Added `rush-order-impact-panel.test.ts`.
- Covered both a material/bottleneck-constrained rush insertion and a no-downstream-impact insertion.

## Verification

- Target unit: 2/2 passed.
- Focused coverage: 100% statements, branches, functions, and lines.
