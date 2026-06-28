# 2026-06-19 Issue - Offline Demo Equipment Quiet Fallback

## Fixed In This Slice
- Equipment offline demo previously displayed technical text from intentional backend skips:
  - `Offline demo mode skipped backend request: /api/v1/equipment`
  - `Offline demo mode skipped backend request: /api/v1/equipment/statistics`
- The UI now keeps the fallback data visible without showing these technical skip messages.

## Still Open
- Protected-route redirect from `/scheduling/equipment?offlineDemo=1` to `/scheduling/login` drops the `offlineDemo=1` query.
- Because of that, the login page may not prefer demo login unless offline demo mode was already persisted.
- This is a routing/auth-entry issue, not an EquipmentBoard data-fallback issue.

## Impact
- Equipment page offline demo is now quiet after an authenticated/demo session exists.
- First unauthenticated protected-page entry may still need a dedicated auth-entry improvement so demo credentials work without manually preserving offline-demo state.
