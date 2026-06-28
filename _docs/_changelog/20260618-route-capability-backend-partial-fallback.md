# 2026-06-18 Route Capability Backend Partial Fallback Changelog

## Change

- Hardened `readRouteCapabilityValidationBackendFirst()` so incomplete backend route-capability payloads no longer replace complete local release evidence.
- Added a regression test proving a partial backend payload with only `routeCode` and `traceId` falls back to the complete local route capability record.

## Why

Route capability validation controls whether scheduling may treat a bottleneck operation as released. A partial backend payload must not erase bottleneck resource, candidate equipment, affected orders, capacity gap, changeover, audit, or responsibility details.

## Verification

- RED: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - Failed as expected: backend partial route capability was returned instead of local complete evidence.
- GREEN: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - PASS, `8 passed`.
- Full frontend coverage: `npm run test:unit:coverage`
  - PASS, `111 files / 1065 tests passed`.
  - Totals: statements `89.63%`, branches `77.02%`, functions `89.83%`, lines `92.74%`.
  - `engineering-change-sync.ts`: statements `78.51%`, lines `88.39%`.
- Lint: `npm run lint`
  - PASS.
