# 2026-06-20 BOM detail engineering evidence fail-loud

## Changed
- Updated BOM detail selection refresh to request audit-grade backend readback for:
  - alternate material approval
  - engineering change impact
  - BOM kitting package
- Kept startup engineering evidence loading on default fallback behavior.
- Added regression coverage proving BOM detail refresh passes `{ failLoud: true }` and still keeps the selected BOM detail usable when readback fails.

## Verified
- `npm run test:unit -- tests/unit/bom-board.test.ts -t "keeps BOM detail selection usable when engineering evidence refresh fails"`
- `npm run test:unit -- tests/unit/bom-board.test.ts tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/shortage-risk-sync.test.ts`
- `npm run test:unit -- tests/unit/bom-board.test.ts tests/unit/schedule-board.test.ts tests/unit/engineering-constraint-panel.test.ts tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/shortage-risk-sync.test.ts`
- `npm run build`
