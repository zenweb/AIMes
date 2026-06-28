# 2026-06-19 Changelog: Equipment risk backend partial fallback

## Changed
- Hardened equipment risk backend-first readers so partial backend payloads are not treated as trusted evidence.
- `readEquipmentDowntimeEventBackendFirst` now accepts backend downtime only when it has the full affected-order, mitigation, maintenance-window, and timestamp context.
- `readCustomerEquipmentFaultEvidenceBackendFirst` now accepts backend POC equipment-fault evidence only when telemetry lineage, affected orders, downtime hours, captured signals, and prepared timestamp are complete.

## Evidence
- RED: `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` failed because partial backend payloads were returned directly.
- GREEN: `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` passed, 11 tests.
- Adjacent checks:
  - `npm run test:unit -- tests/unit/equipment-board.test.ts` passed, 17 tests.
  - `npm run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts` passed, 4 tests.
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "equipment|设备|downtime|停机"` passed, 4 tests and 65 skipped by filter.

## Release Gate Note
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.
