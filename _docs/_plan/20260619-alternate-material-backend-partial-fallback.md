# 2026-06-19 Alternate Material Backend Partial Fallback Plan

## Goal

Prevent incomplete backend alternate-material approval payloads from overriding complete local release evidence.

## Success Criteria

- A failing test proves a partial backend alternate-material record currently wins over complete local evidence.
- Production code accepts backend alternate-material evidence only when it satisfies the complete record guard.
- Targeted engineering-change tests pass.
- Full frontend coverage passes.
- Lint passes.

## Result

- Added `keeps local alternate material evidence when backend returns an incomplete record`.
- Updated `readAlternateMaterialApprovalBackendFirst()` to require `isAlternateMaterialApproval(record)` before using backend data.
- Verified targeted, full coverage, and lint gates.

## Stop Condition

This slice is complete once docs are written and state evidence is updated.
