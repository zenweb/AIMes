# 2026-06-20 Shortage Supply Backend Fail Loud

## Changed
- Added fail-loud support to shortage and supply latest backend reads.
- Covered shortage kitting, shortage risk resolution, BOM kitting package, supply risk escalation, and supplier network decision reads.
- Backend-first sync readers now propagate fail-loud options and preserve local fallback behavior outside fail-loud mode.
- Latest backend records continue to be trusted only after passing their existing complete evidence guards.

## Validation
- `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` -> 13 passed.
- `npm run test:unit -- tests/unit/shortage-evidence-api.test.ts` -> 3 passed.
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "短缺|缺料|供应|supplier|network|外协|采购"` -> 9 passed, 28 skipped.
- `npm run test:unit -- tests/unit/bom-board.test.ts -t "齐套|缺料|kitting|BOM|供应"` -> 17 passed, 8 skipped.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "短缺|缺料|kitting|供应|supplier|外协"` -> 2 passed, 67 skipped.
- `npm run test:unit -- tests/unit/shortage-action-panel.test.ts` -> 3 passed.
- `npm run lint -- src/api/shortageEvidence.ts src/utils/shortage-risk-sync.ts tests/unit/shortage-risk-sync.test.ts tests/unit/shortage-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/shortageEvidence.ts src/frontend/src/utils/shortage-risk-sync.ts src/frontend/tests/unit/shortage-risk-sync.test.ts src/frontend/tests/unit/shortage-evidence-api.test.ts` -> passed with CRLF warnings only.
