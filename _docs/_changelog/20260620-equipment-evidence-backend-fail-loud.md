# 2026-06-20 Changelog: Equipment Evidence Backend Fail Loud

- Added optional fail-loud support to `getLatestEquipmentDowntime` and `getLatestCustomerEquipmentFault`.
- Hardened `readEquipmentDowntimeEventBackendFirst` so incomplete backend downtime records fail loud when requested instead of silently falling back to local evidence.
- Hardened `readCustomerEquipmentFaultEvidenceBackendFirst` so incomplete customer telemetry evidence fails loud when requested.
- Preserved ordinary startup/demo behavior: optional reads still fall back to local equipment evidence unless the caller opts into `failLoud`.

## Verification

- RED: `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` failed with 4 new failures because fail-loud reads resolved `null` instead of rejecting.
- RED: `npm run test:unit -- tests/unit/equipment-evidence-api.test.ts` failed with 1 new failure because API fail-loud reads resolved `null` instead of rejecting.
- GREEN: `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` passed: 15 tests.
- GREEN: `npm run test:unit -- tests/unit/equipment-evidence-api.test.ts` passed: 3 tests.
- Adjacent filtered: `npm run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts -t "equipment|设备|fault|故障|downtime|停机"` passed: 3 passed, 1 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/report-board.test.ts -t "equipment|设备|fault|故障|POC|客户"` passed: 7 passed, 21 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "equipment|设备|downtime|停机|fault|故障"` passed: 5 passed, 66 skipped.
- Adjacent: `npm run test:unit -- tests/unit/poc-evidence-governance.test.ts` passed: 2 tests.
- Lint: `npm run lint -- src/api/equipmentEvidence.ts src/utils/equipment-risk-sync.ts tests/unit/equipment-risk-sync.test.ts tests/unit/equipment-evidence-api.test.ts` passed.
- Diff hygiene: `git diff --check -- src/frontend/src/api/equipmentEvidence.ts src/frontend/src/utils/equipment-risk-sync.ts src/frontend/tests/unit/equipment-risk-sync.test.ts src/frontend/tests/unit/equipment-evidence-api.test.ts` exited 0 with LF/CRLF normalization warnings only.
