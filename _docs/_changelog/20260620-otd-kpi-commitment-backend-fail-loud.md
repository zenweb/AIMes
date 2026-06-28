# 2026-06-20 OTD KPI Commitment Backend Fail Loud

## Changed
- Added fail-loud support to OTD KPI commitment list and latest backend reads.
- `readOtdKpiCommitmentPackagesBackendFirst()` now rejects non-array backend audit payloads in fail-loud mode with `后端返回非数组 OTD KPI 承诺审计载荷`.
- OTD KPI commitment backend list records are filtered through the complete commitment package guard before being trusted.
- Latest OTD KPI commitment reads now require a complete package before replacing local customer promise evidence.

## Validation
- `npm run test:unit -- tests/unit/otd-kpi-commitment-sync.test.ts` -> 11 passed.
- `npm run test:unit -- tests/unit/otd-kpi-commitment-evidence-api.test.ts` -> 3 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "KPI|OTD|承诺|commitment|drilldown|钻取"` -> 11 passed, 17 skipped.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "OTD|承诺|commitment|客户"` -> 7 passed, 62 skipped.
- `npm run test:unit -- tests/unit/otd-evidence-chain-sync.test.ts tests/unit/otd-evidence-api.test.ts` -> 8 passed.
- `npm run test:unit -- tests/unit/outsourcing-commitment-sync.test.ts -t "OTD|承诺|commitment|外协"` -> 12 passed.
- `npm run lint -- src/api/otdKpiCommitmentEvidence.ts src/utils/otd-kpi-commitment-sync.ts tests/unit/otd-kpi-commitment-sync.test.ts tests/unit/otd-kpi-commitment-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/otdKpiCommitmentEvidence.ts src/frontend/src/utils/otd-kpi-commitment-sync.ts src/frontend/tests/unit/otd-kpi-commitment-sync.test.ts src/frontend/tests/unit/otd-kpi-commitment-evidence-api.test.ts` -> passed with CRLF warnings only.
