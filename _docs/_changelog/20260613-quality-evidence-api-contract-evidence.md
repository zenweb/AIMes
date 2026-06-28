# 2026-06-13 Changelog: Quality evidence API contract evidence

## Changed

- Added direct unit contract evidence for `src/api/qualityEvidence.ts`.
- Covered quality rework impact and MRB disposition latest/upsert endpoints.
- Covered optional latest-read fallback behavior.

## Verification

- `npm run test:unit -- tests/unit/quality-evidence-api.test.ts` => 2 passed.
- `npm run test:unit -- tests/unit/quality-evidence-api.test.ts tests/unit/quality-rework-sync.test.ts tests/unit/quality-mrb-disposition-sync.test.ts tests/unit/quality-board.test.ts` => 36 passed.
- `npm run test:unit:coverage -- tests/unit/quality-evidence-api.test.ts` => focused summary 100% statements and 100% lines.

