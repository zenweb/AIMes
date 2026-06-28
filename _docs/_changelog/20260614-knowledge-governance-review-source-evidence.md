# 2026-06-14 Knowledge Governance Review Source Evidence

## Change
- Added focused unit evidence for the existing knowledge governance review path.
- Covered the transition where an expired pending `CNC-01 主轴维护手册` review becomes an indexed, valid, auditable source for AI assistant, scheduling, risk review, and audit replay.

## Evidence
- `npm run test:unit -- tests/unit/knowledge-governance-sync.test.ts`
  - 1 file passed.
  - 7 tests passed.
- `npm run test:unit:coverage -- tests/unit/knowledge-governance-sync.test.ts`
  - `knowledge-governance-sync.ts`: statements 85.71%, branches 90.47%, functions 93.33%, lines 88.09%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 670 tests passed.
  - global lines 82.12%.
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "过期待索引文档复核后成为 AI 助手可引用来源"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; the implementation already supported the review-to-source transition.
- Gray observation / 15-day monitoring remains skipped/deferred by owner direction and is not counted as completed.
