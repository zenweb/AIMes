# 2026-06-19 Route Capability Fail Loud Partial Payload Changelog

## Change

- Hardened `readRouteCapabilityValidationBackendFirst({ failLoud: true })` so incomplete backend route capability payloads throw instead of silently falling back to local evidence.
- Added a regression test proving a partial backend payload with only `routeCode` and `traceId` is rejected when fail-loud evidence is required.

## Why

Routing and scheduling flows use fail-loud route capability reads when they need trustworthy release evidence. A malformed backend payload must be surfaced to the UI instead of being hidden behind local fallback.

## Verification

- RED: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - Failed as expected: fail-loud partial payload resolved to local evidence instead of rejecting.
- GREEN: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - PASS, `10 passed`.
- Full frontend coverage: `npm run test:unit:coverage`
  - PASS, `111 files / 1067 tests passed`.
  - Totals: statements `89.62%`, branches `77.03%`, functions `89.79%`, lines `92.74%`.
  - `engineering-change-sync.ts`: statements `78.98%`, lines `88.69%`.
- Lint: `npm run lint`
  - PASS.
