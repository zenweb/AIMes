# 2026-05-21 P3 — R3 灰度推荐排序与助手引用

## 触发

`QK-TRAIN-20260521-R3` 已完成合并、审批、灰度前校验和灰度发布，但质量推荐排序与 AI 助手仍只读取 `published` 的 R2 版本，R3 灰度发布还没有真正影响推荐链路。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `selectActiveQualityKnowledgeRecommendationVersion()`：
  - 同一工单/工序同时存在 `published` 与 `gray_published` 时优先选 R3 灰度发布版本。
  - 同状态下按发布时间和版本号稳定排序。
- 新增 `qualityKnowledgeRecommendationReleaseScopeLabel()`：
  - R3 灰度发布显示为 `OP-20 装配扭矩推荐链路`。
  - R2 正式发布继续显示原推荐范围。
- `质量闭环 / 质量知识复用排序`：
  - R3 灰度发布后展示 `已灰度发布 / 93 分`。
  - 展示 `QK-TRAIN-20260521-R3`、`OP-20 装配扭矩推荐链路`、`AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001` 和 `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED`。
- `AI 生产助手`：
  - 扫码质量复用回答读取 active version。
  - R3 场景回答 `QK-TRAIN-20260521-R3 已灰度发布`，并保留 `89 -> 93 分` 推荐采纳反馈。
- `AI 助手引用链`：
  - 来源升级为 `QK-TRAIN-20260521-R3 已灰度发布训练集`。
  - 阻断说明引用 R3 灰度发布审计和追踪号。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 首次运行 `npm run test:e2e -- tests/e2e/quality.spec.ts --grep "R3 灰度发布"` 因 `已灰度发布` 同时出现在状态标签和推荐描述中触发 Playwright strict mode；已把断言收紧到 `.ranking-topline`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "R3 灰度发布"`，1 passed。

## 下一步

继续把 R3 灰度后的采用率、复验通过率和误召回监控接入 Agent 治理或报表趋势，让灰度发布不只改变推荐展示，也能形成灰度监控指标。
