# 2026-05-20 P2 — 工程数据进入排产约束解释

## 触发

深化计划中 P2 明确要求“工程数据变约束来源”，验收重点是排产解释能引用 BOM/路线约束，而不是只在 BOM 和工艺路线页面静态展示。

## 产出

- 新增 `src/frontend/src/components/schedule/EngineeringConstraintPanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 在 `AI 排产` 页面新增“工程数据约束”解释面板。
- 展示 `BOM-A100 V1.0` 替代料规则：`M-AL-6061B` 可替代 `M-AL-6061`。
- 展示 `R-A100 OP-020` CNC 工艺能力约束：标准准备时间、单件工时、可用设备集合、替代设备换线代价。
- 展示 `R-A100 OP-040` 质量参数约束：扭矩检验窗口不可取消，只能移动前后工序。
- 缺料事件生成 Agent 重排建议时，会引用 BOM 替代料规则和工艺路线能力要求。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`，15 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，84 passed。
- 非阻断警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900k。

## 下一步

继续深化 P2/P3：优先让质量事件返工影响排产和 OTD，或让人员技能/班组排班进入排产约束。
