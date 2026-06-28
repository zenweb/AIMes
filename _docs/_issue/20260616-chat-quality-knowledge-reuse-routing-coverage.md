# 2026-06-16 Chat Quality Knowledge Reuse Routing Coverage Issue

## Status

Closed for this slice.

## Problem

The AI production assistant had a routing conflict: quality knowledge reuse questions were classified as generic quality rework impact because the broad rework branch ran first.

## Impact

Users asking how to reuse same-defect scan/rework CAPA knowledge could miss the deeper evidence chain covering sample ingestion, draft disposition, formal CAPA verification, retraining release, and recommendation feedback.

## Resolution

Added a dedicated quality knowledge reuse intent and excluded it from the generic quality rework impact route.

## Verification

- Red test reproduced the wrong route.
- Green test confirms the assistant now returns `扫码质量复用建议`.
- Targeted ChatPanel suite: `68 passed`.
- Full frontend suite: `111 files / 1051 tests passed`.

## Remaining Gaps

- Keyword intent routing is still order-sensitive.
- Future assistant route additions need tests that prove the intended branch wins over broader neighboring intents.
