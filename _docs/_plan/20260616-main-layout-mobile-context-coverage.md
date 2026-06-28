# 2026-06-16 MainLayout Mobile Context Coverage Plan

## Goal

Harden the existing application shell by proving mobile module selection closes navigation while preserving active module context.

## Scope

- Existing feature only: `MainLayout.vue`.
- No new navigation routes or UI scope.
- No production-code change unless tests expose a real defect.

## Steps

1. Route by coverage leverage and user-critical path value after Dashboard reached high coverage.
2. Establish MainLayout targeted coverage baseline.
3. Fix targeted test isolation so unrelated child components do not pollute coverage evidence.
4. Add focused unit evidence for active module context and mobile navigation close behavior.
5. Verify targeted new test, targeted MainLayout coverage, and full frontend coverage.
6. Update docs and task state.

## Result

Completed. MainLayout mobile navigation/context coverage is now verified, and full frontend regression remains green.
