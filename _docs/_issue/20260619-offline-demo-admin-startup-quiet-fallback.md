# 2026-06-19 Issue: Offline demo admin startup technical message leak

## Problem
- System Management startup aggregated intentional offline-demo backend skips into a visible alert.
- The visible message included implementation details such as `Offline demo mode skipped backend request: /api/v1/scheduling/knowledge-governance-reviews`.

## Impact
- Offline demo looked partially broken even though local fallback data and governance panels remained usable.
- The message exposed internal request mechanics instead of a polished operator-facing demo state.

## Resolution
- The generic admin evidence loader now ignores `OfflineDemoApiError`.
- Admin configuration and notification fallback catches also skip adding offline-demo errors to the startup alert.
- Real backend failures remain part of the startup alert aggregation.

## Evidence
- RED test reproduced the alert leak.
- GREEN tests passed for offline-demo quiet fallback and ordinary startup failure aggregation.
- Real browser confirmed `/scheduling/admin?offlineDemo=1` has no alert and no backend-skip text.
