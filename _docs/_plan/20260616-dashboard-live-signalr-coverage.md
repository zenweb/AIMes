# 2026-06-16 Dashboard Live SignalR Coverage Plan

## Goal

Harden the existing homepage command tower by proving live monitoring updates refresh visible Dashboard KPI and equipment state.

## Scope

- Existing feature only: `DashboardBoard.vue`.
- No new product scope.
- No production-code change unless tests expose a real defect.

## Steps

1. Re-run Dashboard targeted coverage to establish the baseline.
2. Inspect uncovered Dashboard behavior and choose a user-critical path.
3. Add focused unit evidence for SignalR KPI and equipment pushes.
4. Verify targeted new test, targeted Dashboard coverage, and full frontend coverage.
5. Update docs and task state.

## Result

Completed. Dashboard live SignalR update coverage is now verified, and full frontend regression remains green.
