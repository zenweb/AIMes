# 2026-06-20 Quality Rework Backend Fail Loud

## Changed
- Added fail-loud support to quality rework latest backend reads.
- `readQualityReworkImpactBackendFirst()` now propagates fail-loud options to the quality evidence API and rethrows backend failures when requested.
- Existing behavior remains unchanged outside fail-loud mode: unavailable or incomplete backend evidence falls back to local auditable rework impact.

## Validation
- `npm run test:unit -- tests/unit/quality-rework-sync.test.ts` -> 10 passed.
- `npm run test:unit -- tests/unit/quality-evidence-api.test.ts` -> 3 passed.
- `npm run test:unit -- tests/unit/quality-board.test.ts -t "返工|rework|质量|quality"` -> 9 passed, 26 skipped.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "返工|rework|质量|quality|OTD"` -> 13 passed, 15 skipped.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "返工|rework|质量|quality|复验"` -> 1 passed, 68 skipped.
- `npm run test:unit -- tests/unit/quality-rework-impact-panel.test.ts` -> 2 passed.
- `npm run lint -- src/api/qualityEvidence.ts src/utils/quality-rework-sync.ts tests/unit/quality-rework-sync.test.ts tests/unit/quality-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/qualityEvidence.ts src/frontend/src/utils/quality-rework-sync.ts src/frontend/tests/unit/quality-rework-sync.test.ts src/frontend/tests/unit/quality-evidence-api.test.ts` -> passed with CRLF warnings only.
