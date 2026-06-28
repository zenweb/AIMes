# 2026-06-19 Plan: Equipment risk backend partial fallback

## Success Criteria
- Equipment downtime backend-first reads must not accept partial evidence that cannot explain affected orders and mitigation intent.
- Customer equipment-fault backend-first reads must not accept partial evidence that cannot explain telemetry lineage and POC governance scope.
- Complete local evidence must remain visible when backend readback is incomplete.
- Adjacent equipment and scheduling consumers must keep passing.

## Execution
- Add RED tests for partial backend downtime and customer equipment-fault payloads.
- Apply minimal shape guards at the backend-first read boundary.
- Run targeted and adjacent unit tests.

## Result
- Completed.
- Verification:
  - `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts`
  - `npm run test:unit -- tests/unit/equipment-board.test.ts`
  - `npm run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "equipment|设备|downtime|停机"`
