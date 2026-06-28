# 2026-06-15 Issue: ScheduleImpactPanel coverage gap

## Problem

`ScheduleImpactPanel` did not have an independent unit test file. The panel is part of the scheduler decision path, but its baseline vs Agent comparison display could regress without focused evidence.

## Impact

- Schedulers could lose visibility into OTD improvement, delayed-order reduction, changeover delta, utilization delta, or reason tags before adopting a plan.
- A no-regression Agent option with `0` deltas could accidentally become visually ambiguous.

## Resolution

- Added `schedule-impact-panel.test.ts`.
- Covered both an improved Agent plan and a neutral no-regression plan.

## Verification

- Target unit: 2/2 passed.
- Focused coverage: 100% statements, branches, functions, and lines.
