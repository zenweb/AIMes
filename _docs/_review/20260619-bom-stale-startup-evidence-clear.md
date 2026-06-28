# Review: BOM stale startup evidence clear

Date: 2026-06-19

## Findings

No blocking findings in this slice.

## Checks

- The change is scoped to `BomBoard` engineering evidence alert lifecycle.
- The root cause was that startup engineering evidence failures were retained even after selection-time evidence refresh succeeded.
- The fix clears only the startup engineering evidence bucket, preserving unrelated list/detail/explosion/current operation alerts.
- Existing BOM tests for list fallback, detail fallback, explosion fallback, engineering evidence refresh failure, alternate material release, ECN decisioning, kitting package publication, and OTD evidence sync remained green.
- Full frontend coverage and lint remained green.

## Residual risk

This slice does not add browser evidence because it is deterministic alert lifecycle behavior covered by component tests. Strict v1.0.0 release readiness still cannot be claimed while the gray observation gate remains deferred.
