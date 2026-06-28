# 2026-06-19 Alternate Material Backend Partial Fallback Changelog

## Change

- Hardened `readAlternateMaterialApprovalBackendFirst()` so incomplete backend alternate-material approval payloads no longer replace complete local release evidence.
- Added a regression test proving a partial backend payload with only `alternateMaterialCode` and `traceId` falls back to the complete local approval record.

## Why

Alternate-material approval is a release gate for BOM, scheduling, and OTD recovery evidence. A partial backend payload must not erase BOM identity, source material, affected orders, approver, approval time, audit id, or release summary.

## Verification

- RED: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - Failed as expected: backend partial alternate-material payload was returned instead of local complete evidence.
- GREEN: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - PASS, `9 passed`.
- Full frontend coverage: `npm run test:unit:coverage`
  - PASS, `111 files / 1066 tests passed`.
  - Totals: statements `89.62%`, branches `77.02%`, functions `89.79%`, lines `92.74%`.
  - `engineering-change-sync.ts`: statements `78.67%`, lines `88.49%`.
- Lint: `npm run lint`
  - PASS.
