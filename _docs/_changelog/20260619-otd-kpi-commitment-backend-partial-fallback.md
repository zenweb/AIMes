# 2026-06-19 OTD KPI Commitment Backend Partial Fallback

## Changed
- Hardened `readOtdKpiCommitmentPackagesBackendFirst` so incomplete backend commitment packages cannot replace complete local customer commitment evidence.
- Hardened `readLatestOtdKpiCommitmentPackageBackendFirst` so incomplete backend latest commitment cannot hide the local complete customer promise package.
- Added regression coverage for partial backend list payloads and partial latest payloads.

## Verification
- RED: `npm run test:unit -- tests/unit/otd-kpi-commitment-sync.test.ts` failed on both partial backend list/latest cases before implementation.
- GREEN: `npm run test:unit -- tests/unit/otd-kpi-commitment-sync.test.ts` passed: 8 tests.
- GREEN: `npm run test:unit -- tests/unit/otd-kpi-commitment-evidence-api.test.ts` passed: 2 tests.
- GREEN filtered adjacency: `report-board.test.ts -t "OTD KPI|承诺|commitment|客户承诺"` passed: 4 selected, 24 skipped.
- GREEN filtered adjacency: `schedule-board.test.ts -t "OTD KPI|commitment|客户承诺|承诺"` passed: 4 selected, 65 skipped.
- GREEN: `npm run lint -- src/utils/otd-kpi-commitment-sync.ts tests/unit/otd-kpi-commitment-sync.test.ts tests/unit/otd-kpi-commitment-evidence-api.test.ts`.
- GREEN: `git diff --check -- src/frontend/src/utils/otd-kpi-commitment-sync.ts src/frontend/tests/unit/otd-kpi-commitment-sync.test.ts` reported only CRLF normalization warnings.
