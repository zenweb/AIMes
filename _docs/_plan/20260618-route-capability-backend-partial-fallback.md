# 2026-06-18 Route Capability Backend Partial Fallback Plan

## Goal

Prevent incomplete backend route capability payloads from overriding complete local capability release evidence.

## Success Criteria

- A failing test proves a partial backend route capability record currently wins over complete local evidence.
- Production code accepts backend route capability evidence only when it satisfies the complete record guard.
- Targeted engineering-change tests pass.
- Full frontend coverage passes.
- Lint passes.

## Result

- Added `keeps local route capability evidence when backend returns an incomplete record`.
- Updated `readRouteCapabilityValidationBackendFirst()` to require `isRouteCapabilityValidation(record)` before using backend data.
- Verified targeted, full coverage, and lint gates.

## Stop Condition

This slice is complete once docs are written and state evidence is updated.
