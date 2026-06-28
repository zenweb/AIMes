# 2026-06-19 Route Capability Fail Loud Partial Payload Plan

## Goal

Make mandatory route capability backend reads fail loud when the backend returns incomplete release evidence.

## Success Criteria

- A failing test proves `failLoud` currently hides an incomplete backend payload behind local fallback.
- Production code throws a clear error for incomplete backend route capability evidence when `failLoud` is set.
- Targeted engineering-change tests pass.
- Full frontend coverage passes.
- Lint passes.

## Result

- Added `throws incomplete route capability backend payloads when fail-loud evidence is required`.
- Updated `readRouteCapabilityValidationBackendFirst()` to throw `后端返回非完整工艺能力放行证据` for non-empty malformed backend payloads under `failLoud`.
- Verified targeted, full coverage, and lint gates.

## Stop Condition

This slice is complete once docs are written and state evidence is updated.
