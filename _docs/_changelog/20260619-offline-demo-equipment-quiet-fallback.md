# 2026-06-19 Offline Demo Equipment Quiet Fallback

## Change
- EquipmentBoard now treats `OfflineDemoApiError` from `/api/v1/equipment` and `/api/v1/equipment/statistics` as an intentional offline-demo skip.
- Offline demo still renders equipment and statistics fallback data, but no longer exposes the technical backend-skip message in the UI.
- Ordinary backend failures remain fail-loud and continue to show the existing equipment list/statistics fallback alerts.

## Evidence
- RED verified:
  - `npm run test:unit -- tests/unit/equipment-board.test.ts -t "quietly shows demo equipment"` failed because an alert was still rendered.
  - `npm run test:unit -- tests/unit/equipment-board.test.ts -t "quietly shows demo statistics"` failed because an alert was still rendered.
- GREEN verified:
  - `npm run test:unit -- tests/unit/equipment-board.test.ts -t "quietly shows demo equipment"`: 1 passed.
  - `npm run test:unit -- tests/unit/equipment-board.test.ts -t "quietly shows demo statistics"`: 1 passed.
  - `npm run test:unit -- tests/unit/equipment-board.test.ts -t "equipment list falls back"`: 1 passed.
  - `npm run test:unit -- tests/unit/equipment-board.test.ts -t "equipment statistics fall back"`: 1 passed.
  - `npm run test:unit -- tests/unit/equipment-board.test.ts`: 17 passed.
  - Offline demo regression package: 19 files passed, 410 tests passed.
  - `npm run build`: passed.
- Real browser evidence at `http://127.0.0.1:4173/scheduling/equipment?offlineDemo=1`:
  - `hasBackendSkip: false`
  - `hasEquipmentListFailure: false`
  - `hasEquipmentStatisticsFailure: false`
  - `alertCount: 0`
  - `cardCount: 2`
  - `hasDemoEquipment: true`
  - `statsText: ["4/8", "72%", "95%", "1"]`
