# 2026-05-21 P3 — 质量推荐实验驱动主动选择

## 触发

质量推荐实验池已经能在 Agent 治理和报表里展示 R3/R4/R5 的采纳、复验、误召回和扩大/回滚结果，但推荐排序仍缺少明确的“实验结果影响推荐选择”证据。R4 扩大确认后应成为主动推荐优先版本，R5 回滚后应被排除并沉淀为负样本与风险阈值。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `selectPrioritizedQualityKnowledgeRecommendationVersion()`：
  - 已获质量主管确认扩大的灰度版本优先于普通灰度观察版本。
  - 已回滚版本从主动推荐选择中排除。
  - 兼容 R3 重新灰度发布的既有回滚/重开校验逻辑。
- `质量闭环 / 质量知识复用排序` 新增实验选择证据：
  - R4 扩大确认后显示 `实验扩大优先`。
  - 推荐卡展示扩大决策审计与追踪。
  - R5 回滚后显示为已回滚排除版本。
- AI 助手引用链与知识引用来源改用同一实验优先选择器，避免助手回答和质量推荐排序口径不一致。
- `文档上传 / 质量知识资产治理` 新增：
  - `实验负样本`：沉淀 R5 回滚、误召回指标、回滚审计和主动推荐排除原因。
  - `风险阈值`：沉淀后续扩大灰度的门禁阈值，要求推荐采纳率 100%、复验通过率不低于 95%、负样本误召回 0 次。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts --grep "R4 扩大|R5 回滚实验"`，2 passed。

## 下一步

继续把实验风险阈值推向 Admin 可配置治理：支持调整扩大门禁阈值并进入审批/审计回放。
