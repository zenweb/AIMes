# 2026-06-14 Knowledge Next Training Action Disambiguation

## Change
- Hardened `KnowledgeGovernancePanel.vue` next-training lifecycle actions.
- Added asset-specific accessible names for R3 approval, pre-gray validation, and gray publish buttons.
- Fixed next-training version matching so exact recommendation feedback IDs win before training-set-version fallback.
- The fallback now only uses `trainingSetVersion` when it is unambiguous, preventing multiple R3 assets from binding to the wrong version state.

## Evidence
- RED first:
  - `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts -t "labels next-training lifecycle actions with the asset title"`
  - Failed because lifecycle buttons had no asset-specific `aria-label`, and multiple R3 assets all matched the first R3 version.
- GREEN:
  - `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts -t "labels next-training lifecycle actions with the asset title"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts`
  - 1 file passed.
  - 5 tests passed.
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "下一轮训练集候选合并反馈后完成 R3 审批校验和灰度发布"`
  - Chromium: 1 test passed.
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts`
  - Chromium: 21 tests passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 682 tests passed.
  - global lines 83.13%.
  - `KnowledgeGovernancePanel.vue`: full-run lines 96.19%.

## Notes
- Focused component coverage command proved `KnowledgeGovernancePanel.vue` at 96.19% lines, but exited non-zero because project-wide thresholds are not meaningful when running a single component file alone.
- The full frontend coverage command is the authoritative threshold check for this slice.
- Gray observation / 15-day monitoring is skipped/deferred by owner direction and is not counted as a current blocker.
