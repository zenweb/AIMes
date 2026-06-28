# 2026-06-18 Engineering Change Backend Partial Fallback Changelog

## Change

- Hardened `readEngineeringChangeImpactAnalysisBackendFirst()` so incomplete backend engineering-impact payloads no longer get default-filled into apparently complete release evidence.
- Added a regression test proving a complete local engineering-impact record is preserved when the backend returns only `changeId` and `traceId`.

## Why

Engineering change impact evidence is reused by BOM, Routing, Schedule, Admin, and Chat flows. A partial backend payload must not override a complete local audit chain, because that would hide missing inventory, quality, supplier, cost, OTD, and responsibility fields.

## Verification

- RED: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - Failed as expected: backend partial record was returned instead of local complete evidence.
- GREEN: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage.enabled=false`
  - PASS, `7 passed`.
- Targeted coverage: `npx vitest run tests/unit/engineering-change-sync.test.ts --coverage`
  - PASS, `7 passed`.
- Full frontend coverage: `npm run test:unit:coverage`
  - PASS, `111 files / 1064 tests passed`.
  - Totals: statements `89.62%`, branches `77.03%`, functions `89.79%`, lines `92.74%`.
- Lint: `npm run lint`
  - PASS.
