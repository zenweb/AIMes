# 2026-06-20 Engineering evidence fail-loud readback

## Changed
- Added `failLoud` read options to alternate material and engineering change impact API reads.
- Propagated fail-loud backend-first read behavior through `engineering-change-sync`.
- Added API contract coverage for engineering evidence endpoint paths and optional/fail-loud read semantics.
- Added sync coverage so alternate material and ECN impact backend failures are not hidden when audit-grade evidence is required.

## Verified
- `npm run test:unit:coverage`
- `npm run test:unit -- tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts`
- `npm run test:unit -- tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/bom-board.test.ts tests/unit/schedule-board.test.ts tests/unit/engineering-constraint-panel.test.ts`
- `npm run build`
