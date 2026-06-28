# 2026-06-19 Review: Equipment risk backend partial fallback

## Scope
- Reviewed `equipment-risk-sync.ts` backend-first readers for equipment downtime and customer equipment-fault evidence.
- Focused on backend payload completeness before evidence is used by equipment, scheduling, and POC governance views.

## Finding
- Local storage reads already removed incomplete records.
- Backend-first reads trusted `getLatestEquipmentDowntime` and `getLatestCustomerEquipmentFault` results directly, so a partial backend payload could override a complete local record.

## Resolution
- Reused existing guards:
  - `isEquipmentDowntimeEvent`
  - `isCustomerEquipmentFaultEvidence`
- Backend records that fail these guards now fall back to the local complete record.

## Verification
- `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts`: 11 passed.
- `npm run test:unit -- tests/unit/equipment-board.test.ts`: 17 passed.
- `npm run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`: 4 passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "equipment|设备|downtime|停机"`: 4 passed, 65 skipped by filter.

## Residual Risk
- This is frontend evidence-shape containment. Live staging should still verify the backend emits complete equipment risk and POC fault evidence records.
