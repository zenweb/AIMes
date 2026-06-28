# 2026-06-20 Quality MRB Backend Partial Fail Loud

## Changed
- Added fail-loud support to quality MRB latest backend reads.
- `readQualityMrbDispositionRecordBackendFirst()` now validates backend latest records through the existing complete MRB disposition guard before replacing local evidence.
- Incomplete backend MRB records no longer replace complete local MRB disposition evidence.
- Existing normal-mode fallback remains: unavailable or incomplete backend evidence falls back to local auditable MRB records.

## Validation
- `npm run test:unit -- tests/unit/quality-mrb-disposition-sync.test.ts` -> 8 passed.
- `npm run test:unit -- tests/unit/quality-evidence-api.test.ts` -> 4 passed.
- `npm run test:unit -- tests/unit/quality-board.test.ts -t "MRB|处置|mrb|quality"` -> 14 passed, 21 skipped.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "MRB|处置|mrb|quality|OTD"` -> 13 passed, 15 skipped.
- `npm run test:unit -- tests/unit/quality-mrb-disposition-panel.test.ts` -> 6 passed.
- `npm run test:unit -- tests/unit/otd-evidence-chain-sync.test.ts` -> 6 passed.
- `npm run lint -- src/api/qualityEvidence.ts src/utils/quality-mrb-disposition-sync.ts tests/unit/quality-mrb-disposition-sync.test.ts tests/unit/quality-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/qualityEvidence.ts src/frontend/src/utils/quality-mrb-disposition-sync.ts src/frontend/tests/unit/quality-mrb-disposition-sync.test.ts src/frontend/tests/unit/quality-evidence-api.test.ts` -> passed with CRLF warnings only.
