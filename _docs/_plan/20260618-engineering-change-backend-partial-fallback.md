# 2026-06-18 Engineering Change Backend Partial Fallback Plan

## Goal

Prevent incomplete backend engineering-change impact payloads from overriding complete local audit evidence.

## Success Criteria

- A failing test proves backend partial engineering-impact evidence currently wins over complete local evidence.
- Production code accepts backend engineering-impact evidence only when it satisfies the complete record guard.
- Targeted engineering-change tests pass.
- Full frontend coverage passes.
- Lint passes.

## Result

- Added `keeps local engineering impact evidence when backend returns an incomplete record`.
- Updated `readEngineeringChangeImpactAnalysisBackendFirst()` to require `isEngineeringChangeImpactAnalysis(record)` before using backend data.
- Verified targeted, full coverage, and lint gates.

## Stop Condition

This slice is complete once docs are written and state evidence is updated.
