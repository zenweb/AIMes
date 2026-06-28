# 2026-06-15 KittingClosurePanel coverage issue

## Issue
KittingClosurePanel had weak evidence for two user-critical inventory closure paths:

- Backend BOM kitting package rendering.
- Material anomaly dispatch isolation publishing shortage and OTD evidence records.

## Impact
The UI could regress in the handoff from BOM / anomaly evidence into inventory kitting review and AI scheduling without focused unit tests.

## Resolution
- Added direct tests for BOM kitting package display and shortage card state.
- Added direct tests for material anomaly batch isolation writing both shortage event and OTD evidence-chain records.
- Verified focused and full frontend coverage.

## Status
Resolved for this slice. Broader CC remediation remains active.
