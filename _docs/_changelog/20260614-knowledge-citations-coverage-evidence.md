# 2026-06-14 Knowledge Citations Coverage Evidence

## Change
- Added focused unit coverage for `src/frontend/src/utils/knowledge-citations.ts`.
- Covered assistant citation governance for:
  - no persisted barcode quality sample;
  - invalid sample without reusable recommendation/evidence chain;
  - valid persisted barcode quality sample;
  - CAPA reuse draft blocked pending quality engineer review;
  - verified CAPA closure with retraining release and field feedback;
  - CNC maintenance governance review upgrade;
  - unrelated question returning no fabricated citation.

## Evidence
- `npm run test:unit -- tests/unit/knowledge-citations.test.ts`
  - 1 file passed.
  - 7 tests passed.
- `npm run test:unit:coverage -- tests/unit/knowledge-citations.test.ts`
  - `knowledge-citations.ts`: statements 80.85%, branches 63.33%, functions 83.33%, lines 81.81%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 655 tests passed.
  - global statements 77.45%, branches 61.76%, functions 73.10%, lines 81.08%.
- `npm run test:e2e -- tests/e2e/quality.spec.ts -g "已发布再训练版本提升 OP-20 推荐排序并进入助手引用"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Release Note
- Gray observation remains owner-deferred per 2026-06-14 instruction and is not used as a blocking step for this work item.
