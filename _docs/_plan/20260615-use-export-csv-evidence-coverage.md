# 2026-06-15 useExport CSV Evidence Coverage Plan

## Objective

Improve evidence for shared CSV export behavior without expanding product scope.

## Selection Rationale

After auth/router, HTTP, and notifications, `useExport` was a compact shared workflow with direct user value: report and schedule evidence leaves the product through CSV export.

## Execution

1. Read `src/composables/useExport.ts` and existing tests.
2. Add filename timestamp coverage.
3. Add data-row escaping coverage for commas, quotes, and newlines.
4. Assert temporary download-link cleanup.
5. Run focused tests, focused coverage, and report/schedule export regressions.
6. Record evidence in five documentation streams.

## Result

No implementation change was needed. The added tests proved the existing export hook contract.

